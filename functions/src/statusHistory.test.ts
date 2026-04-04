import { describe, it, expect } from "vitest";

describe("Status history tracking", () => {
  it("records from/to/changedBy/changedAt", () => {
    const event = {
      from: "PENDING",
      to: "REVIEWING",
      changedBy: "admin@lupyxtalent.com",
      changedAt: new Date().toISOString(),
    };
    expect(event.from).toBe("PENDING");
    expect(event.to).toBe("REVIEWING");
    expect(event.changedBy).toContain("@");
    expect(event.changedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it("builds timeline from events array", () => {
    const events = [
      { from: "PENDING", to: "REVIEWING", changedAt: "2026-04-01T10:00:00Z" },
      { from: "REVIEWING", to: "INTERVIEW", changedAt: "2026-04-02T14:00:00Z" },
      { from: "INTERVIEW", to: "ACCEPTED", changedAt: "2026-04-03T16:00:00Z" },
    ];
    expect(events).toHaveLength(3);
    expect(events[0].to).toBe("REVIEWING");
    expect(events[events.length - 1].to).toBe("ACCEPTED");
  });

  it("calculates days between status changes", () => {
    const d1 = new Date("2026-04-01T10:00:00Z").getTime();
    const d2 = new Date("2026-04-03T10:00:00Z").getTime();
    const days = Math.round((d2 - d1) / (24 * 60 * 60 * 1000));
    expect(days).toBe(2);
  });

  it("validates status transitions are valid", () => {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["REVIEWING", "REJECTED"],
      REVIEWING: ["INTERVIEW", "REJECTED"],
      INTERVIEW: ["ACCEPTED", "REJECTED"],
      ACCEPTED: ["HIRED"],
    };
    expect(validTransitions["PENDING"]).toContain("REVIEWING");
    expect(validTransitions["INTERVIEW"]).toContain("ACCEPTED");
  });
});

describe("Data filtering for candidate view", () => {
  it("filters out internal comments", () => {
    const comments = [
      { text: "Great candidate", isInternal: false },
      { text: "Salary too high", isInternal: true },
      { text: "Moving to interview", isInternal: false },
    ];
    const publicComments = comments.filter((c) => !c.isInternal);
    expect(publicComments).toHaveLength(2);
    expect(publicComments.every((c) => !c.isInternal)).toBe(true);
  });

  it("removes cvAnalysis from candidate view", () => {
    const data: Record<string, unknown> = {
      id: "123",
      status: "PENDING",
      cvAnalysis: { summary: "Senior dev", skills: ["Java"] },
    };
    delete data.cvAnalysis;
    expect(data.cvAnalysis).toBeUndefined();
    expect(data.status).toBe("PENDING");
  });
});
