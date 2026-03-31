import { getFirestore } from "firebase-admin/firestore";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  "submitApplication": { maxRequests: 3, windowMs: 15 * 60 * 1000 },
  "listJobs": { maxRequests: 60, windowMs: 60 * 1000 },
  "default": { maxRequests: 30, windowMs: 60 * 1000 },
};

export async function checkRateLimit(
  identifier: string,
  endpoint: string,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const config = LIMITS[endpoint] || LIMITS["default"];
  const db = getFirestore();
  const key = `rate_limits/${endpoint}_${identifier.replace(/[/.]/g, "_")}`;
  const now = Date.now();

  const doc = await db.doc(key).get();
  const data = doc.data();

  if (!data || now > data.resetAt) {
    await db.doc(key).set({
      count: 1,
      resetAt: now + config.windowMs,
      updatedAt: now,
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (data.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: data.resetAt };
  }

  await db.doc(key).update({ count: data.count + 1, updatedAt: now });
  return { allowed: true, remaining: config.maxRequests - data.count - 1, resetAt: data.resetAt };
}

export function rateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
