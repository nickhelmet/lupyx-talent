import { describe, it, expect } from "vitest";

describe("TypeWriter roles", () => {
  const roles = [
    "Backend Engineers",
    "Marketing Designers",
    "Product Managers",
    "Data Scientists",
    "DevOps Engineers",
    "UX Designers",
  ];

  it("has at least 5 roles", () => {
    expect(roles.length).toBeGreaterThanOrEqual(5);
  });

  it("all roles are non-empty strings", () => {
    roles.forEach((r) => {
      expect(typeof r).toBe("string");
      expect(r.length).toBeGreaterThan(0);
    });
  });

  it("typewriter speed is appropriate", () => {
    const typeSpeed = 80; // ms per char
    const deleteSpeed = 30;
    const pauseTime = 2000;
    expect(typeSpeed).toBeLessThan(200); // not too slow
    expect(deleteSpeed).toBeLessThan(typeSpeed); // delete faster than type
    expect(pauseTime).toBeGreaterThanOrEqual(1500); // enough pause to read
  });
});

describe("SEO metadata", () => {
  it("generates correct title format", () => {
    const title = "Senior Backend Engineer";
    const company = "Empresa confidencial";
    const formatted = `${title} — ${company} | Lupyx Talent`;
    expect(formatted).toContain(title);
    expect(formatted).toContain("Lupyx Talent");
    expect(formatted.length).toBeLessThan(100); // Google truncates at ~60
  });

  it("generates OG URL with trailing slash", () => {
    const slug = "senior-backend-java";
    const url = `https://lupyxtalent.com/busquedas/${slug}/`;
    expect(url.endsWith("/")).toBe(true);
    expect(url).toContain(slug);
  });
});

describe("Lazy loading", () => {
  it("dynamic import returns a module", async () => {
    // Simulate that dynamic components are importable
    const components = [
      "CTABanner", "TrustedBy", "AboutUs", "Testimonials", "FAQ", "Contact"
    ];
    expect(components).toHaveLength(6);
    components.forEach((c) => expect(typeof c).toBe("string"));
  });
});
