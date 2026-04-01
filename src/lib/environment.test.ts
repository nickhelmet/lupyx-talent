import { describe, it, expect, vi, beforeEach } from "vitest";

describe("environment", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("getApiBase returns emulator URL in dev", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_EMULATORS", "true");
    const { getApiBase } = await import("./environment");
    expect(getApiBase()).toContain("localhost:5001");
  });

  it("getApiBase returns production URL when not emulator", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_EMULATORS", "false");
    const mod = await import("./environment");
    expect(mod.getApiBase()).toContain("cloudfunctions.net");
  });

  it("getEnvironment returns development for emulators", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_EMULATORS", "true");
    const { getEnvironment } = await import("./environment");
    expect(getEnvironment()).toBe("development");
  });
});
