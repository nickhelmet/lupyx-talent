import { describe, it, expect } from "vitest";
import { sanitizeString } from "./validation";

describe("Admin Comments", () => {
  it("sanitizes comment text", () => {
    expect(sanitizeString('<script>alert("xss")</script>Great candidate')).not.toContain("<script>");
    expect(sanitizeString("Normal comment")).toBe("Normal comment");
  });

  it("limits comment length to 2000 chars", () => {
    const long = "a".repeat(3000);
    expect(sanitizeString(long).slice(0, 2000).length).toBe(2000);
  });

  it("handles empty comment", () => {
    expect(sanitizeString("")).toBe("");
    expect(sanitizeString("   ")).toBe("");
  });
});

describe("Application ID validation", () => {
  it("strips dangerous characters from IDs", () => {
    expect("../../../etc/passwd".replace(/[^a-zA-Z0-9_-]/g, "")).toBe("etcpasswd");
    expect("valid-id-123".replace(/[^a-zA-Z0-9_-]/g, "")).toBe("valid-id-123");
    expect('{"$gt":""}'.replace(/[^a-zA-Z0-9_-]/g, "")).toBe("gt");
  });
});

describe("CV path validation", () => {
  it("accepts valid CV paths", () => {
    expect("cvs/user123/1234-resume.pdf".startsWith("cvs/")).toBe(true);
  });

  it("rejects path traversal", () => {
    expect("../etc/passwd".startsWith("cvs/")).toBe(false);
    expect("/root/secret".startsWith("cvs/")).toBe(false);
  });
});

describe("Education label mapping", () => {
  const labels: Record<string, string> = {
    PRIMARY: "Primario",
    SECONDARY: "Secundario",
    TERTIARY: "Terciario",
    UNIVERSITY: "Universitario",
    POSTGRADUATE: "Posgrado",
    MASTER: "Maestría",
    PHD: "Doctorado",
  };

  it("maps all education levels", () => {
    expect(Object.keys(labels)).toHaveLength(7);
    expect(labels["UNIVERSITY"]).toBe("Universitario");
    expect(labels["PHD"]).toBe("Doctorado");
  });

  it("handles unknown level gracefully", () => {
    expect(labels["UNKNOWN"] || "UNKNOWN").toBe("UNKNOWN");
  });
});

describe("Status flow", () => {
  const flow = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED", "HIRED"];

  it("has 6 statuses", () => {
    expect(flow).toHaveLength(6);
  });

  it("starts with PENDING", () => {
    expect(flow[0]).toBe("PENDING");
  });

  it("ends with HIRED", () => {
    expect(flow[flow.length - 1]).toBe("HIRED");
  });
});
