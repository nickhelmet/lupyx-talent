import { describe, it, expect } from "vitest";
import { timeAgo } from "./utils";

describe("timeAgo", () => {
  it("returns empty for undefined", () => {
    expect(timeAgo(undefined)).toBe("");
  });

  it("returns 'Hace un momento' for recent dates", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("Hace un momento");
  });

  it("returns minutes for recent dates", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("Hace 5 min");
  });

  it("returns hours", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe("Hace 3h");
  });

  it("returns days", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe("Hace 2 días");
  });

  it("returns weeks", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoWeeksAgo)).toBe("Hace 2 semanas");
  });

  it("handles Firestore timestamp object", () => {
    const ts = { _seconds: Math.floor((Date.now() - 3600000) / 1000) };
    expect(timeAgo(ts)).toBe("Hace 1h");
  });
});
