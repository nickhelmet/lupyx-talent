import { describe, it, expect } from "vitest";
import { ALLOWED_ORIGINS, getCorsHeaders } from "./corsConfig";

describe("ALLOWED_ORIGINS", () => {
  it("includes production domains", () => {
    expect(ALLOWED_ORIGINS).toContain("https://lupyxtalent.com");
    expect(ALLOWED_ORIGINS).toContain("https://www.lupyxtalent.com");
    expect(ALLOWED_ORIGINS).toContain("https://lupyx-talent.web.app");
  });

  it("includes localhost for dev", () => {
    expect(ALLOWED_ORIGINS).toContain("http://localhost:3000");
  });
});

describe("getCorsHeaders", () => {
  it("returns correct origin for allowed domain", () => {
    const headers = getCorsHeaders("https://lupyxtalent.com");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://lupyxtalent.com");
  });

  it("returns default origin for unknown domain", () => {
    const headers = getCorsHeaders("https://evil.com");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://lupyxtalent.com");
  });

  it("returns default for null origin", () => {
    const headers = getCorsHeaders(null);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://lupyxtalent.com");
  });

  it("includes required CORS headers", () => {
    const headers = getCorsHeaders("https://lupyxtalent.com");
    expect(headers["Access-Control-Allow-Methods"]).toContain("GET");
    expect(headers["Access-Control-Allow-Methods"]).toContain("POST");
    expect(headers["Access-Control-Allow-Headers"]).toContain("Authorization");
    expect(headers["Access-Control-Max-Age"]).toBe("3600");
  });
});
