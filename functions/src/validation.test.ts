import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  validateEmail,
  validatePhone,
  validateDNI,
  validateJobStatus,
  validateApplicationStatus,
  validateEducationLevel,
  isPDFBuffer,
} from "./validation";

describe("sanitizeString", () => {
  it("strips HTML tags", () => {
    expect(sanitizeString("<script>alert('xss')</script>hello")).toBe("alert('xss')hello");
  });

  it("strips HTML entities", () => {
    expect(sanitizeString("hello&amp;world")).toBe("helloworld");
  });

  it("trims whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("truncates long strings", () => {
    const long = "a".repeat(20000);
    expect(sanitizeString(long).length).toBe(10000);
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeString(123)).toBe("");
    expect(sanitizeString(null)).toBe("");
    expect(sanitizeString(undefined)).toBe("");
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBe("user@example.com");
    expect(validateEmail("Test@Gmail.COM")).toBe("test@gmail.com");
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("notanemail")).toBeNull();
    expect(validateEmail("@missing.com")).toBeNull();
    expect(validateEmail("")).toBeNull();
    expect(validateEmail(123)).toBeNull();
  });
});

describe("validatePhone", () => {
  it("accepts valid phones", () => {
    expect(validatePhone("+54 11 1234-5678")).toBe("+54 11 1234-5678");
    expect(validatePhone("1234567890")).toBe("1234567890");
  });

  it("rejects short phones", () => {
    expect(validatePhone("123")).toBeNull();
    expect(validatePhone("")).toBeNull();
  });

  it("strips invalid characters", () => {
    expect(validatePhone("+54-11-abc-1234-5678")).toBe("+54-11--1234-5678");
  });
});

describe("validateDNI", () => {
  it("accepts valid DNIs", () => {
    expect(validateDNI("32787493")).toBe("32787493");
    expect(validateDNI("12.345.678")).toBe("12345678");
  });

  it("rejects invalid DNIs", () => {
    expect(validateDNI("123")).toBeNull();
    expect(validateDNI("123456789")).toBeNull();
    expect(validateDNI("")).toBeNull();
  });
});

describe("validateJobStatus", () => {
  it("accepts valid statuses", () => {
    expect(validateJobStatus("ACTIVE")).toBe("ACTIVE");
    expect(validateJobStatus("PAUSED")).toBe("PAUSED");
    expect(validateJobStatus("CLOSED")).toBe("CLOSED");
  });

  it("rejects invalid statuses", () => {
    expect(validateJobStatus("INVALID")).toBeNull();
    expect(validateJobStatus("")).toBeNull();
  });
});

describe("validateApplicationStatus", () => {
  it("accepts all valid statuses", () => {
    const valid = ["PENDING", "REVIEWING", "INTERVIEW", "REJECTED", "ACCEPTED", "HIRED"];
    valid.forEach((s) => expect(validateApplicationStatus(s)).toBe(s));
  });

  it("rejects invalid statuses", () => {
    expect(validateApplicationStatus("INVALID")).toBeNull();
  });
});

describe("validateEducationLevel", () => {
  it("accepts all valid levels", () => {
    const valid = ["PRIMARY", "SECONDARY", "TERTIARY", "UNIVERSITY", "POSTGRADUATE", "MASTER", "PHD"];
    valid.forEach((l) => expect(validateEducationLevel(l)).toBe(l));
  });

  it("rejects invalid levels", () => {
    expect(validateEducationLevel("NONE")).toBeNull();
  });
});

describe("isPDFBuffer", () => {
  it("detects valid PDF", () => {
    const pdf = Buffer.from("%PDF-1.4 ...");
    expect(isPDFBuffer(pdf)).toBe(true);
  });

  it("rejects non-PDF", () => {
    expect(isPDFBuffer(Buffer.from("not a pdf"))).toBe(false);
    expect(isPDFBuffer(Buffer.from(""))).toBe(false);
    expect(isPDFBuffer(Buffer.from("PK"))).toBe(false);
  });
});
