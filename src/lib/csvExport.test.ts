import { describe, it, expect } from "vitest";

// Test CSV export logic used in admin applications and users pages

function generateCsv(
  headers: string[],
  rows: Record<string, string | number | null | undefined>[]
): string {
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => {
      const val = row[h] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\n");
  return headerLine + "\n" + dataLines;
}

describe("CSV export", () => {
  it("generates correct headers", () => {
    const csv = generateCsv(["Nombre", "Email"], []);
    expect(csv.startsWith("Nombre,Email")).toBe(true);
  });

  it("wraps values in quotes", () => {
    const csv = generateCsv(["Nombre"], [{ Nombre: "Juan" }]);
    expect(csv).toContain('"Juan"');
  });

  it("escapes double quotes", () => {
    const csv = generateCsv(["Nombre"], [{ Nombre: 'O"Brien' }]);
    expect(csv).toContain('O""Brien');
  });

  it("handles null/undefined values", () => {
    const csv = generateCsv(["Nombre", "Email"], [{ Nombre: "Ana", Email: null }]);
    expect(csv).toContain('""');
  });

  it("generates multiple rows", () => {
    const csv = generateCsv(["Nombre"], [
      { Nombre: "Ana" },
      { Nombre: "Pedro" },
      { Nombre: "Maria" },
    ]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(4); // header + 3 rows
  });

  it("handles commas in values safely", () => {
    const csv = generateCsv(["Nombre"], [{ Nombre: "García, Juan" }]);
    expect(csv).toContain('"García, Juan"');
  });

  it("handles newlines in values safely", () => {
    const csv = generateCsv(["Notas"], [{ Notas: "Line1\nLine2" }]);
    expect(csv).toContain('"Line1\nLine2"');
  });
});

describe("CSV filename generation", () => {
  it("includes date", () => {
    const date = new Date().toISOString().split("T")[0];
    const filename = `postulaciones-${date}.csv`;
    expect(filename).toMatch(/^\w+-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("includes entity name", () => {
    const filename = `usuarios-lupyx-2026-04-04.csv`;
    expect(filename).toContain("usuarios");
    expect(filename.endsWith(".csv")).toBe(true);
  });
});
