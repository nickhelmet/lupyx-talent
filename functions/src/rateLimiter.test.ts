import { describe, it, expect } from "vitest";
import { rateLimit } from "./rateLimiter";

function mockReq(ip = "1.2.3.4") {
  return { headers: { "x-forwarded-for": ip }, ip };
}

function mockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let body: unknown = null;
  return {
    set: (k: string, v: string) => { headers[k] = v; },
    status: (code: number) => {
      statusCode = code;
      return { json: (b: unknown) => { body = b; } };
    },
    getHeaders: () => headers,
    getStatus: () => statusCode,
    getBody: () => body,
  };
}

describe("In-memory Rate Limiter", () => {
  it("allows requests within limit", async () => {
    const res = mockRes();
    const result = await rateLimit(mockReq("10.0.0.1"), res, "listJobs");
    expect(result).toBe(true);
    expect(res.getHeaders()["X-RateLimit-Remaining"]).toBe("59");
  });

  it("blocks after exceeding limit", async () => {
    // Use unique IP to avoid collision with other tests
    const ip = "10.0.0.2";
    for (let i = 0; i < 3; i++) {
      await rateLimit(mockReq(ip), mockRes(), "submitApplication", `user-${ip}`);
    }
    const res = mockRes();
    const result = await rateLimit(mockReq(ip), res, "submitApplication", `user-${ip}`);
    expect(result).toBe(false);
    expect(res.getStatus()).toBe(429);
    expect(res.getHeaders()["X-RateLimit-Remaining"]).toBe("0");
  });

  it("uses userId when provided instead of IP", async () => {
    const res = mockRes();
    await rateLimit(mockReq("10.0.0.3"), res, "userProfile", "uid-123");
    expect(res.getHeaders()["X-RateLimit-Remaining"]).toBe("19");
  });

  it("sets correct headers", async () => {
    const res = mockRes();
    await rateLimit(mockReq("10.0.0.4"), res, "listJobs");
    expect(res.getHeaders()["X-RateLimit-Remaining"]).toBeDefined();
    expect(res.getHeaders()["X-RateLimit-Reset"]).toBeDefined();
  });

  it("different endpoints have separate counters", async () => {
    const ip = "10.0.0.5";
    const res1 = mockRes();
    const res2 = mockRes();
    await rateLimit(mockReq(ip), res1, "listJobs");
    await rateLimit(mockReq(ip), res2, "adminDashboard", "admin-1");
    expect(res1.getHeaders()["X-RateLimit-Remaining"]).toBe("59"); // 60 - 1
    expect(res2.getHeaders()["X-RateLimit-Remaining"]).toBe("19"); // 20 - 1
  });
});
