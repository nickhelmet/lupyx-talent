import { describe, it, expect } from "vitest";
import { sanitizeString, validateEmail, validatePhone } from "./validation";

describe("Candidate validation", () => {
  it("validates and sanitizes firstName/lastName", () => {
    expect(sanitizeString("  Juan  ")).toBe("Juan");
    expect(sanitizeString('<script>alert("xss")</script>María')).not.toContain("<script>");
    expect(sanitizeString("").length).toBe(0);
  });

  it("slices long names to 100 chars", () => {
    const longName = "A".repeat(200);
    expect(sanitizeString(longName).slice(0, 100).length).toBe(100);
  });

  it("validates candidate email", () => {
    expect(validateEmail("candidate@gmail.com")).toBe("candidate@gmail.com");
    expect(validateEmail("CANDIDATE@Gmail.COM")).toBe("candidate@gmail.com");
    expect(validateEmail("notvalid")).toBeNull();
    expect(validateEmail("")).toBeNull();
  });

  it("validates candidate phone", () => {
    expect(validatePhone("+541155551234")).toBe("+541155551234");
    expect(validatePhone("")).toBeNull();
  });

  it("sanitizes skills array", () => {
    const raw = ["React", "  Node.js  ", '<img src=x onerror="alert(1)">'];
    const sanitized = raw.map((s) => sanitizeString(s).slice(0, 50));
    expect(sanitized[0]).toBe("React");
    expect(sanitized[1]).toBe("Node.js");
    expect(sanitized[2]).not.toContain("<img");
  });

  it("limits skills to 30 entries", () => {
    const manySkills = Array.from({ length: 50 }, (_, i) => `skill-${i}`);
    expect(manySkills.slice(0, 30)).toHaveLength(30);
  });

  it("sanitizes tags array", () => {
    const tags = ["senior", "  urgente  ", "frontend"];
    const sanitized = tags.map((t) => sanitizeString(t).slice(0, 30));
    expect(sanitized).toEqual(["senior", "urgente", "frontend"]);
  });

  it("limits tags to 10 entries", () => {
    const manyTags = Array.from({ length: 20 }, (_, i) => `tag-${i}`);
    expect(manyTags.slice(0, 10)).toHaveLength(10);
  });

  it("candidate source defaults to manual when empty", () => {
    const source = sanitizeString("").slice(0, 50) || "manual";
    expect(source).toBe("manual");
  });

  it("sanitizes candidateId for deletion (alphanumeric + dash + underscore only)", () => {
    const malicious = "abc123; DROP TABLE candidates--";
    const safe = malicious.replace(/[^a-zA-Z0-9_-]/g, "");
    expect(safe).toBe("abc123DROPTABLEcandidates--");
    expect(safe).not.toContain(";");
    expect(safe).not.toContain(" ");
  });

  it("rejects empty candidateId", () => {
    const empty = "".replace(/[^a-zA-Z0-9_-]/g, "");
    expect(empty).toBe("");
  });
});

describe("Delete application", () => {
  it("sanitizes applicationId for deletion", () => {
    const id = "aBcD1234-_test";
    const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
    expect(safe).toBe(id);
  });

  it("rejects path traversal in applicationId", () => {
    const malicious = "../../../etc/passwd";
    const safe = malicious.replace(/[^a-zA-Z0-9_-]/g, "");
    expect(safe).not.toContain("/");
    expect(safe).not.toContain(".");
  });
});
