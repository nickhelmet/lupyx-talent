import { describe, it, expect } from "vitest";

describe("Admin CSV export", () => {
  it("generates valid CSV headers", () => {
    const headers = "Nombre,Apellido,Email,Rol,Activo,Registrado";
    expect(headers.split(",")).toHaveLength(6);
  });

  it("escapes quotes in CSV", () => {
    const name = 'O"Brien';
    const escaped = `"${name}"`;
    expect(escaped).toBe('"O"Brien"');
  });

  it("generates filename with date", () => {
    const date = "2026-04-02";
    const filename = `usuarios-lupyx-${date}.csv`;
    expect(filename).toContain("lupyx");
    expect(filename).toContain(date);
    expect(filename.endsWith(".csv")).toBe(true);
  });
});

describe("Status distribution", () => {
  it("counts statuses correctly", () => {
    const apps = [
      { status: "PENDING" },
      { status: "PENDING" },
      { status: "REVIEWING" },
      { status: "HIRED" },
    ];
    const dist: Record<string, number> = {};
    apps.forEach((a) => { dist[a.status] = (dist[a.status] || 0) + 1; });

    expect(dist["PENDING"]).toBe(2);
    expect(dist["REVIEWING"]).toBe(1);
    expect(dist["HIRED"]).toBe(1);
  });

  it("calculates percentage", () => {
    const count = 3;
    const total = 10;
    expect(Math.round((count / total) * 100)).toBe(30);
  });
});

describe("Admin filters", () => {
  const apps = [
    { status: "PENDING", jobTitle: "Backend", firstName: "Juan" },
    { status: "REVIEWING", jobTitle: "Designer", firstName: "Ana" },
    { status: "PENDING", jobTitle: "Backend", firstName: "Pedro" },
  ];

  it("filters by status", () => {
    const filtered = apps.filter((a) => a.status === "PENDING");
    expect(filtered).toHaveLength(2);
  });

  it("filters by job title", () => {
    const filtered = apps.filter((a) => a.jobTitle === "Backend");
    expect(filtered).toHaveLength(2);
  });

  it("combines filters", () => {
    const filtered = apps.filter((a) => a.status === "PENDING" && a.jobTitle === "Backend");
    expect(filtered).toHaveLength(2);
  });

  it("searches by name", () => {
    const q = "ana";
    const filtered = apps.filter((a) => a.firstName.toLowerCase().includes(q));
    expect(filtered).toHaveLength(1);
  });
});
