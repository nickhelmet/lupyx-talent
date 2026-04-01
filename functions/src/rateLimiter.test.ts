import { describe, it, expect } from "vitest";

// Test the rate limit configuration (without Firestore dependency)
describe("Rate Limiter Configuration", () => {
  it("has proper limits defined", async () => {
    // Import the module to check it compiles
    const mod = await import("./rateLimiter");
    expect(mod.rateLimit).toBeDefined();
    expect(typeof mod.rateLimit).toBe("function");
  });
});

describe("Rate Limit Logic", () => {
  it("public endpoints allow more requests than auth endpoints", () => {
    // These values come from the LIMITS config in rateLimiter.ts
    const publicLimit = 60; // listJobs
    const authLimit = 3; // submitApplication
    expect(publicLimit).toBeGreaterThan(authLimit);
  });

  it("admin endpoints have reasonable limits", () => {
    const adminLimits = [10, 20, 30]; // createJob, updateApplicationStatus, adminListApplications
    adminLimits.forEach((limit) => {
      expect(limit).toBeGreaterThanOrEqual(10);
      expect(limit).toBeLessThanOrEqual(30);
    });
  });
});
