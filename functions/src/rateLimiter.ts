import { getFirestore } from "firebase-admin/firestore";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  submitApplication: { maxRequests: 3, windowSeconds: 900 },
  listJobs: { maxRequests: 60, windowSeconds: 60 },
  userProfile: { maxRequests: 20, windowSeconds: 60 },
  getNotifications: { maxRequests: 30, windowSeconds: 60 },
  markNotificationRead: { maxRequests: 30, windowSeconds: 60 },
  createJob: { maxRequests: 10, windowSeconds: 60 },
  updateJob: { maxRequests: 10, windowSeconds: 60 },
  updateJobStatus: { maxRequests: 10, windowSeconds: 60 },
  adminListApplications: { maxRequests: 30, windowSeconds: 60 },
  updateApplicationStatus: { maxRequests: 20, windowSeconds: 60 },
  addInterviewNotes: { maxRequests: 20, windowSeconds: 60 },
  manageInterviewRounds: { maxRequests: 20, windowSeconds: 60 },
  listUsers: { maxRequests: 30, windowSeconds: 60 },
  updateUserRole: { maxRequests: 10, windowSeconds: 60 },
  toggleUserStatus: { maxRequests: 10, windowSeconds: 60 },
  adminDashboard: { maxRequests: 20, windowSeconds: 60 },
  fraudAnalysis: { maxRequests: 10, windowSeconds: 60 },
  listApplications: { maxRequests: 20, windowSeconds: 60 },
};

function getClientIP(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || "unknown";
}

/**
 * Check rate limit. Returns true if allowed, false if blocked.
 * Sets rate limit headers on the response.
 * If blocked, sends 429 response automatically.
 */
export async function rateLimit(
  req: { headers: Record<string, string | string[] | undefined>; ip?: string },
  res: { set: (key: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } },
  endpoint: string,
  userId?: string,
): Promise<boolean> {
  const config = LIMITS[endpoint] || { maxRequests: 30, windowSeconds: 60 };
  const identifier = userId || getClientIP(req);
  const db = getFirestore();
  const key = `rate_limits/${endpoint}_${identifier.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  try {
    const doc = await db.doc(key).get();
    const data = doc.data();

    if (!data || now > data.resetAt) {
      // New window
      await db.doc(key).set({
        count: 1,
        resetAt: now + windowMs,
      });
      setHeaders(res, config.maxRequests - 1, now + windowMs);
      return true;
    }

    if (data.count >= config.maxRequests) {
      // Blocked
      setHeaders(res, 0, data.resetAt);
      res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((data.resetAt - now) / 1000),
      });
      console.warn(`Rate limited: ${endpoint} by ${identifier} (${data.count}/${config.maxRequests})`);
      return false;
    }

    // Increment
    await db.doc(key).update({ count: data.count + 1 });
    setHeaders(res, config.maxRequests - data.count - 1, data.resetAt);
    return true;
  } catch (error) {
    // On error, allow request (fail open) but log
    console.error(`Rate limiter error for ${endpoint}:`, error);
    return true;
  }
}

function setHeaders(res: { set: (key: string, value: string) => void }, remaining: number, resetAt: number) {
  res.set("X-RateLimit-Remaining", String(remaining));
  res.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
}
