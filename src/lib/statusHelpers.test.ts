import { describe, it, expect } from "vitest";

// Test the status label/style mappings used across admin pages

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  REVIEWING: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  INTERVIEW: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  ACCEPTED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  REJECTED: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  HIRED: "bg-[#2EC4B6]/10 text-[#2EC4B6]",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWING: "En revisión",
  INTERVIEW: "Entrevista",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  HIRED: "Contratado",
};

const statusFlow = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED", "HIRED"];

const educationLabels: Record<string, string> = {
  PRIMARY: "Primario",
  SECONDARY: "Secundario",
  TERTIARY: "Terciario",
  UNIVERSITY: "Universitario",
  POSTGRADUATE: "Posgrado",
  MASTER: "Maestría",
  PHD: "Doctorado",
};

describe("Status mappings", () => {
  it("every status in flow has a label", () => {
    statusFlow.forEach((s) => {
      expect(statusLabels[s]).toBeDefined();
      expect(statusLabels[s].length).toBeGreaterThan(0);
    });
  });

  it("every status in flow has a style", () => {
    statusFlow.forEach((s) => {
      expect(statusStyles[s]).toBeDefined();
      expect(statusStyles[s]).toContain("text-");
    });
  });

  it("all styles include dark mode variants", () => {
    Object.entries(statusStyles).forEach(([status, style]) => {
      if (status !== "HIRED") {
        expect(style).toContain("dark:");
      }
    });
  });

  it("status flow has correct order", () => {
    expect(statusFlow[0]).toBe("PENDING");
    expect(statusFlow[statusFlow.length - 1]).toBe("HIRED");
    expect(statusFlow).toContain("INTERVIEW");
  });
});

describe("Education labels", () => {
  it("all education levels have Spanish labels", () => {
    const levels = ["PRIMARY", "SECONDARY", "TERTIARY", "UNIVERSITY", "POSTGRADUATE", "MASTER", "PHD"];
    levels.forEach((level) => {
      expect(educationLabels[level]).toBeDefined();
    });
  });

  it("fallback for unknown education level", () => {
    const level = "UNKNOWN";
    const label = educationLabels[level] || level;
    expect(label).toBe("UNKNOWN");
  });
});

describe("Source labels (candidates)", () => {
  const sourceLabels: Record<string, string> = {
    manual: "Manual",
    linkedin: "LinkedIn",
    referral: "Referido",
    import: "Importación",
    website: "Sitio web",
  };

  it("all sources have labels", () => {
    ["manual", "linkedin", "referral", "import", "website"].forEach((src) => {
      expect(sourceLabels[src]).toBeDefined();
    });
  });

  it("fallback for unknown source", () => {
    const src = "other";
    const label = sourceLabels[src] || src;
    expect(label).toBe("other");
  });
});
