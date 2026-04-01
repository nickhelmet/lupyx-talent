import { describe, it, expect } from "vitest";
import { track } from "./analytics";

describe("analytics", () => {
  it("track object has all required event functions", () => {
    expect(track.jobView).toBeDefined();
    expect(track.jobApplyStart).toBeDefined();
    expect(track.jobApplyComplete).toBeDefined();
    expect(track.linkedinClick).toBeDefined();
    expect(track.instagramClick).toBeDefined();
    expect(track.contactClick).toBeDefined();
    expect(track.login).toBeDefined();
    expect(track.signup).toBeDefined();
    expect(track.darkModeToggle).toBeDefined();
  });

  it("track functions are callable without errors", async () => {
    await expect(track.jobView("test-job", "Test Job")).resolves.not.toThrow();
    await expect(track.linkedinClick()).resolves.not.toThrow();
    await expect(track.login()).resolves.not.toThrow();
  });
});
