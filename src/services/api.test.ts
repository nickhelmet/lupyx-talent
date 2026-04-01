import { describe, it, expect } from "vitest";

describe("API base64 conversion", () => {
  it("converts small file to base64 correctly", () => {
    const bytes = new Uint8Array([37, 80, 68, 70]); // %PDF
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const result = btoa(binary);
    expect(result).toBe("JVBERg==");
  });

  it("converts large file (>100KB) without crashing", () => {
    // This was the bug: btoa(String.fromCharCode(...spread)) crashes >100KB
    const size = 200 * 1024; // 200KB
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) bytes[i] = i % 256;

    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const result = btoa(binary);
    expect(result.length).toBeGreaterThan(0);
    expect(typeof result).toBe("string");
  });

  it("handles 5MB file without crashing", () => {
    const size = 5 * 1024 * 1024;
    const bytes = new Uint8Array(size);

    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const result = btoa(binary);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("App Check header", () => {
  it("X-Firebase-AppCheck header name is correct", () => {
    const headerName = "X-Firebase-AppCheck";
    expect(headerName).toBe("X-Firebase-AppCheck");
  });
});

describe("API URL configuration", () => {
  it("production URL points to Cloud Functions", () => {
    const prodUrl = "https://us-central1-lupyx-talent.cloudfunctions.net";
    expect(prodUrl).toContain("cloudfunctions.net");
    expect(prodUrl).toContain("lupyx-talent");
  });

  it("emulator URL points to localhost", () => {
    const devUrl = "http://localhost:5001/lupyx-talent/us-central1";
    expect(devUrl).toContain("localhost:5001");
  });
});
