import { describe, it, expect } from "vitest";

// Test candidate filtering logic from admin candidates page

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  skills: string[];
  tags: string[];
  source: string;
}

const mockCandidates: Candidate[] = [
  { id: "1", firstName: "Juan", lastName: "García", email: "juan@gmail.com", phone: "+541155551234", city: "Buenos Aires", skills: ["React", "Node.js"], tags: ["senior", "frontend"], source: "linkedin" },
  { id: "2", firstName: "Ana", lastName: "López", email: "ana@yahoo.com", phone: null, city: "Córdoba", skills: ["Python", "Django"], tags: ["senior", "backend"], source: "referral" },
  { id: "3", firstName: "Pedro", lastName: "Martínez", email: null, phone: "+5491166667777", city: null, skills: ["Java", "Spring"], tags: ["junior"], source: "manual" },
  { id: "4", firstName: "María", lastName: "Rodríguez", email: "maria@hotmail.com", phone: null, city: "Rosario", skills: ["React", "TypeScript", "Node.js"], tags: ["senior", "fullstack"], source: "website" },
];

function filterCandidates(candidates: Candidate[], search: string, filterTag: string): Candidate[] {
  return candidates.filter((c) => {
    if (filterTag && !(c.tags || []).includes(filterTag)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      (c.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  });
}

describe("Candidate search", () => {
  it("returns all when no search or filter", () => {
    expect(filterCandidates(mockCandidates, "", "")).toHaveLength(4);
  });

  it("searches by firstName", () => {
    expect(filterCandidates(mockCandidates, "juan", "")).toHaveLength(1);
    expect(filterCandidates(mockCandidates, "juan", "")[0].id).toBe("1");
  });

  it("searches by lastName", () => {
    expect(filterCandidates(mockCandidates, "lópez", "")).toHaveLength(1);
  });

  it("searches by email", () => {
    expect(filterCandidates(mockCandidates, "yahoo", "")).toHaveLength(1);
  });

  it("searches by city", () => {
    expect(filterCandidates(mockCandidates, "rosario", "")).toHaveLength(1);
  });

  it("searches by skill", () => {
    const results = filterCandidates(mockCandidates, "react", "");
    expect(results).toHaveLength(2);
    expect(results.map((c) => c.id)).toEqual(["1", "4"]);
  });

  it("search is case-insensitive", () => {
    expect(filterCandidates(mockCandidates, "PYTHON", "")).toHaveLength(1);
  });

  it("handles candidates with null fields", () => {
    expect(filterCandidates(mockCandidates, "pedro", "")).toHaveLength(1);
  });

  it("returns empty for no match", () => {
    expect(filterCandidates(mockCandidates, "zzzzz", "")).toHaveLength(0);
  });
});

describe("Candidate tag filter", () => {
  it("filters by tag", () => {
    const results = filterCandidates(mockCandidates, "", "senior");
    expect(results).toHaveLength(3);
  });

  it("filters by junior tag", () => {
    const results = filterCandidates(mockCandidates, "", "junior");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("3");
  });

  it("combines search + tag filter", () => {
    const results = filterCandidates(mockCandidates, "react", "senior");
    expect(results).toHaveLength(2);
  });

  it("returns empty when tag doesn't exist", () => {
    expect(filterCandidates(mockCandidates, "", "nonexistent")).toHaveLength(0);
  });
});

describe("Tag extraction", () => {
  it("extracts unique tags sorted", () => {
    const allTags = [...new Set(mockCandidates.flatMap((c) => c.tags || []))].sort();
    expect(allTags).toEqual(["backend", "frontend", "fullstack", "junior", "senior"]);
  });

  it("handles candidates with empty tags", () => {
    const withEmpty = [...mockCandidates, { id: "5", firstName: "X", lastName: "Y", skills: [], tags: [], source: "manual" }];
    const allTags = [...new Set(withEmpty.flatMap((c) => c.tags || []))].sort();
    expect(allTags).toEqual(["backend", "frontend", "fullstack", "junior", "senior"]);
  });
});

describe("Pagination", () => {
  it("slices correctly for page 1", () => {
    const perPage = 2;
    const page = 1;
    const paginated = mockCandidates.slice((page - 1) * perPage, page * perPage);
    expect(paginated).toHaveLength(2);
    expect(paginated[0].id).toBe("1");
  });

  it("slices correctly for page 2", () => {
    const perPage = 2;
    const page = 2;
    const paginated = mockCandidates.slice((page - 1) * perPage, page * perPage);
    expect(paginated).toHaveLength(2);
    expect(paginated[0].id).toBe("3");
  });

  it("handles last incomplete page", () => {
    const perPage = 3;
    const page = 2;
    const paginated = mockCandidates.slice((page - 1) * perPage, page * perPage);
    expect(paginated).toHaveLength(1);
  });
});
