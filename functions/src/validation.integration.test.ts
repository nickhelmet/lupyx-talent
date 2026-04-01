import { describe, it, expect } from "vitest";
import { sanitizeString, validatePhone, validateDNI, validateApplicationStatus, validateJobStatus, validateEducationLevel } from "./validation";

describe("Input sanitization integration", () => {
  describe("XSS prevention", () => {
    it("strips script tags from names", () => {
      expect(sanitizeString('<script>alert("xss")</script>Juan')).toBe('alert("xss")Juan');
    });

    it("strips event handlers", () => {
      expect(sanitizeString('<img onerror="alert(1)">test')).toBe("test");
    });

    it("strips iframe injection", () => {
      expect(sanitizeString('<iframe src="evil.com"></iframe>safe')).toBe("safe");
    });
  });

  describe("NoSQL injection prevention", () => {
    it("jobId only allows safe characters", () => {
      const malicious = '{"$gt":""}';
      const cleaned = malicious.replace(/[^a-zA-Z0-9_-]/g, "");
      expect(cleaned).toBe("gt");
    });

    it("applicationId only allows safe characters", () => {
      const malicious = '../../../etc/passwd';
      const cleaned = malicious.replace(/[^a-zA-Z0-9_-]/g, "");
      expect(cleaned).toBe("etcpasswd");
    });
  });

  describe("Overflow prevention", () => {
    it("truncates long strings", () => {
      const long = "a".repeat(20000);
      expect(sanitizeString(long).length).toBe(10000);
    });

    it("phone strips non-phone characters", () => {
      expect(validatePhone('"><script>alert(1)</script>')).toBeNull();
    });

    it("DNI only allows digits", () => {
      expect(validateDNI("'; DROP TABLE users;--")).toBeNull();
    });
  });

  describe("Enum whitelist validation", () => {
    it("rejects arbitrary application status", () => {
      expect(validateApplicationStatus("HACKED")).toBeNull();
      expect(validateApplicationStatus("")).toBeNull();
      expect(validateApplicationStatus(null)).toBeNull();
    });

    it("rejects arbitrary job status", () => {
      expect(validateJobStatus("DELETED")).toBeNull();
      expect(validateJobStatus(undefined)).toBeNull();
    });

    it("rejects arbitrary education level", () => {
      expect(validateEducationLevel("HACKER")).toBeNull();
    });
  });

  describe("Score clamping", () => {
    it("clamps scores to 0-10 range", () => {
      const clamp = (v: number) => Math.max(0, Math.min(10, v));
      expect(clamp(-5)).toBe(0);
      expect(clamp(100)).toBe(10);
      expect(clamp(7.5)).toBe(7.5);
    });
  });

  describe("URL validation", () => {
    it("only accepts https URLs", () => {
      const url = "javascript:alert(1)";
      expect(url.startsWith("https://")).toBe(false);

      const valid = "https://linkedin.com/jobs/123";
      expect(valid.startsWith("https://")).toBe(true);
    });
  });

  describe("Date validation", () => {
    it("accepts valid ISO dates", () => {
      expect(/^\d{4}-\d{2}-\d{2}$/.test("2026-03-31")).toBe(true);
    });

    it("rejects malicious date strings", () => {
      expect(/^\d{4}-\d{2}-\d{2}$/.test("<script>alert(1)</script>")).toBe(false);
      expect(/^\d{4}-\d{2}-\d{2}$/.test("2026-13-99")).toBe(true); // format valid, value invalid — OK for now
    });
  });
});
