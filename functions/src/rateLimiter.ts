/**
 * In-memory rate limiter — zero Firestore cost.
 * Resets on cold starts, which is acceptable with App Check + maxInstances.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
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
  getAllowlist: { maxRequests: 20, windowSeconds: 60 },
  addAllowlistEmail: { maxRequests: 10, windowSeconds: 60 },
  removeAllowlistEmail: { maxRequests: 10, windowSeconds: 60 },
};

// In-memory store — resets on cold start
const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

function getClientIP(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || "unknown";
}

/**
 * Check rate limit. Returns true if allowed, false if blocked (sends 429).
 */
export async function rateLimit(
  req: { headers: Record<string, string | string[] | undefined>; ip?: string },
  res: { set: (key: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } },
  endpoint: string,
  userId?: string,
): Promise<boolean> {
  const config = LIMITS[endpoint] || { maxRequests: 30, windowSeconds: 60 };
  const identifier = userId || getClientIP(req);
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    res.set("X-RateLimit-Remaining", String(config.maxRequests - 1));
    res.set("X-RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));
    return true;
  }

  if (entry.count >= config.maxRequests) {
    res.set("X-RateLimit-Remaining", "0");
    res.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    });
    console.warn(`Rate limited: ${endpoint} by ${identifier} (${entry.count}/${config.maxRequests})`);
    return false;
  }

  entry.count++;
  res.set("X-RateLimit-Remaining", String(config.maxRequests - entry.count));
  res.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
  return true;
}
