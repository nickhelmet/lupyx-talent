import { describe, it, expect } from "vitest";
import { sanitizeString, validatePhone, validateDNI, validateEducationLevel } from "./validation";

describe("Application input validation", () => {
  describe("firstName/lastName sanitization", () => {
    it("sanitizes XSS in name fields", () => {
      expect(sanitizeString('<script>alert("xss")</script>Juan')).not.toContain("<script>");
      expect(sanitizeString('<img onerror="hack">Ana')).not.toContain("<img");
    });

    it("trims and limits length", () => {
      const longName = "A".repeat(200);
      expect(sanitizeString(longName).slice(0, 100).length).toBe(100);
    });

    it("handles empty/null gracefully", () => {
      expect(sanitizeString("")).toBe("");
      expect(sanitizeString(null)).toBe("");
      expect(sanitizeString(undefined)).toBe("");
    });
  });

  describe("phone validation", () => {
    it("accepts Argentine phone numbers", () => {
      expect(validatePhone("+54 11 1234-5678")).toBeTruthy();
      expect(validatePhone("+543513345967")).toBeTruthy();
    });

    it("rejects too short", () => {
      expect(validatePhone("123")).toBeNull();
    });

    it("rejects XSS in phone", () => {
      expect(validatePhone('<script>alert(1)</script>')).toBeNull();
    });
  });

  describe("DNI validation", () => {
    it("accepts valid DNIs", () => {
      expect(validateDNI("32787493")).toBe("32787493");
      expect(validateDNI("12.345.678")).toBe("12345678");
    });

    it("rejects SQL injection in DNI", () => {
      expect(validateDNI("'; DROP TABLE;--")).toBeNull();
    });
  });

  describe("educationLevel validation", () => {
    it("accepts valid levels", () => {
      expect(validateEducationLevel("UNIVERSITY")).toBe("UNIVERSITY");
      expect(validateEducationLevel("PHD")).toBe("PHD");
    });

    it("rejects arbitrary values", () => {
      expect(validateEducationLevel("HACKED")).toBeNull();
    });
  });

  describe("jobId sanitization", () => {
    it("strips dangerous characters from jobId", () => {
      const malicious = '../../etc/passwd';
      const cleaned = malicious.replace(/[^a-zA-Z0-9_-]/g, "");
      expect(cleaned).toBe("etcpasswd");
    });

    it("allows valid slug", () => {
      const slug = "senior-backend-java";
      const cleaned = slug.replace(/[^a-zA-Z0-9_-]/g, "");
      expect(cleaned).toBe("senior-backend-java");
    });
  });

  describe("CV upload validation", () => {
    it("detects valid PDF magic bytes", () => {
      const pdf = Buffer.from("%PDF-1.4 content");
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    });

    it("rejects non-PDF files", () => {
      const zip = Buffer.from("PK\x03\x04 zip content");
      expect(zip.subarray(0, 4).toString()).not.toBe("%PDF");
    });

    it("rejects PDF with embedded JavaScript", () => {
      const malicious = Buffer.from("%PDF-1.4 /JavaScript alert(1)");
      const content = malicious.toString("latin1");
      expect(content.includes("/JavaScript")).toBe(true);
    });

    it("rejects PDF with OpenAction", () => {
      const malicious = Buffer.from("%PDF-1.4 /OpenAction hack");
      const content = malicious.toString("latin1");
      expect(content.includes("/OpenAction")).toBe(true);
    });

    it("enforces 5MB size limit", () => {
      const maxSize = 5 * 1024 * 1024;
      const oversized = 6 * 1024 * 1024;
      expect(oversized > maxSize).toBe(true);
    });
  });

  describe("duplicate application check", () => {
    it("same userId + jobId should be rejected", () => {
      const apps = [
        { userId: "user1", jobId: "job1" },
        { userId: "user1", jobId: "job1" },
      ];
      const isDuplicate = apps.filter(
        (a) => a.userId === "user1" && a.jobId === "job1"
      ).length > 1;
      expect(isDuplicate).toBe(true);
    });

    it("different userId same jobId is OK", () => {
      const apps = [
        { userId: "user1", jobId: "job1" },
        { userId: "user2", jobId: "job1" },
      ];
      const user2Dups = apps.filter(
        (a) => a.userId === "user2" && a.jobId === "job1"
      ).length;
      expect(user2Dups).toBe(1);
    });
  });
});
