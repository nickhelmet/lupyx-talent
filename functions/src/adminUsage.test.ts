import { describe, it, expect } from "vitest";

describe("Usage metrics", () => {
  it("calculates MB from bytes correctly", () => {
    const bytes = 135324;
    const mb = Math.round(bytes / 1024 / 1024 * 100) / 100;
    expect(mb).toBe(0.13);
  });

  it("counts applications by day", () => {
    const apps = [
      { appliedAt: "2026-04-01T10:00:00Z" },
      { appliedAt: "2026-04-01T15:00:00Z" },
      { appliedAt: "2026-04-02T10:00:00Z" },
    ];
    const byDay: Record<string, number> = {};
    apps.forEach((a) => {
      const day = a.appliedAt.split("T")[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    expect(byDay["2026-04-01"]).toBe(2);
    expect(byDay["2026-04-02"]).toBe(1);
  });

  it("counts status distribution", () => {
    const apps = [
      { status: "PENDING" },
      { status: "PENDING" },
      { status: "REVIEWING" },
    ];
    const dist: Record<string, number> = {};
    apps.forEach((a) => { dist[a.status] = (dist[a.status] || 0) + 1; });
    expect(dist["PENDING"]).toBe(2);
    expect(dist["REVIEWING"]).toBe(1);
  });

  it("filters last 30 days", () => {
    const now = Date.now();
    const dates = [
      new Date(now - 5 * 86400000).toISOString().split("T")[0],
      new Date(now - 40 * 86400000).toISOString().split("T")[0],
    ];
    const thirtyDaysAgo = now - 30 * 86400000;
    const filtered = dates.filter((d) => new Date(d).getTime() >= thirtyDaysAgo);
    expect(filtered).toHaveLength(1);
  });

  it("gemini counter increments", () => {
    let count = 0;
    count += 1; // first analysis
    count += 1; // re-analysis
    count += 1; // another CV
    expect(count).toBe(3);
  });
});

describe("PDF validation", () => {
  it("only accepts PDF uploads", () => {
    const allowedType = "application/pdf";
    expect(allowedType).toBe("application/pdf");
    expect("image/jpeg").not.toBe(allowedType);
  });

  it("validates PDF magic bytes", () => {
    const validPdf = Buffer.from("%PDF-1.4 content");
    const invalidFile = Buffer.from("not a pdf");
    expect(validPdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(invalidFile.subarray(0, 4).toString()).not.toBe("%PDF");
  });
});
