import { describe, it, expect } from "vitest";
import type { Job, Application, User, InterviewRound, Notification } from "./index";

describe("Type definitions", () => {
  it("Job type has required fields", () => {
    const job: Job = {
      id: "test",
      title: "Test Job",
      company: "Test Co",
      description: "desc",
      requirements: "reqs",
      location: "Remote",
      type: "CONTRACT",
      status: "ACTIVE",
      slug: "test-job",
      postedDate: "2026-01-01",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    };
    expect(job.status).toBe("ACTIVE");
    expect(job.type).toBe("CONTRACT");
  });

  it("Application status values are valid", () => {
    const statuses: Application["status"][] = [
      "PENDING", "REVIEWING", "INTERVIEW", "REJECTED", "ACCEPTED", "HIRED",
    ];
    expect(statuses).toHaveLength(6);
  });

  it("User roles are USER or ADMIN", () => {
    const roles: User["role"][] = ["USER", "ADMIN"];
    expect(roles).toContain("USER");
    expect(roles).toContain("ADMIN");
  });

  it("InterviewRound has valid types", () => {
    const types: InterviewRound["type"][] = [
      "PHONE", "VIDEO", "PRESENTIAL", "TECHNICAL", "HR", "PANEL", "CASE_STUDY",
    ];
    expect(types).toHaveLength(7);
  });

  it("Notification types are defined", () => {
    const types: Notification["type"][] = [
      "NEW_APPLICATION", "STATUS_CHANGE", "GENERAL", "WELCOME",
    ];
    expect(types).toHaveLength(4);
  });
});
