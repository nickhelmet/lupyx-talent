"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchJobs } from "@/services/api";
import type { Job } from "@/types";

const typeLabels: Record<string, string> = {
  CONTRACT: "Contractor",
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  INTERNSHIP: "Pasantía",
};

export default function JobListClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const locations = [...new Set(jobs.map((j) => j.location).filter(Boolean))];

  const filtered = jobs.filter((j) => {
    if (filterLocation && j.location !== filterLocation) return false;
    if (!search) return true;
    const q = search.toLowerCase();

    // Search across all text fields
    const haystack = [
      j.title, j.company, j.description, j.requirements,
      j.location, ...(j.tags || []),
    ].join(" ").toLowerCase();

    // Direct match
    if (haystack.includes(q)) return true;

    // Synonym groups — any term in a group matches all others in that group
    const synonymGroups = [
      ["software", "backend", "frontend", "fullstack", "developer", "engineer", "dev", "programador", "desarrollo", "ingeniería", "código", "code"],
      ["diseño", "design", "designer", "figma", "ui", "ux", "gráfico", "graphic", "visual", "creativo", "creative"],
      ["marketing", "growth", "ads", "publicidad", "seo", "sem", "contenido", "content", "redes sociales", "social media", "branding", "comunicación"],
      ["data", "analytics", "datos", "bi", "dashboard", "sql", "ciencia de datos", "data science", "machine learning", "ml", "ia", "ai"],
      ["devops", "cloud", "aws", "gcp", "azure", "infra", "infraestructura", "sre", "docker", "kubernetes", "ci/cd"],
      ["mobile", "android", "ios", "react native", "flutter", "móvil", "app"],
      ["remoto", "remote", "100% remoto", "trabajo remoto", "home office"],
      ["product", "producto", "product manager", "pm", "product owner", "po"],
      ["qa", "testing", "tester", "quality", "calidad", "automation", "automatización"],
      ["rrhh", "recursos humanos", "hr", "people", "talent", "talento", "recruiting", "reclutamiento"],
    ];

    // Find which group the search term belongs to, then check all terms in that group
    const matchingGroup = synonymGroups.find((group) => group.some((term) => term === q || q.includes(term) || term.includes(q)));
    if (matchingGroup) {
      return matchingGroup.some((term) => haystack.includes(term));
    }

    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 dark:bg-[#0a0f1a]">
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white">Búsquedas activas</h1>
        <p className="mt-2 text-[#1F4E79]/70 dark:text-gray-400">
          Explorá las oportunidades que tenemos abiertas. Todas con compensación en USD.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por puesto, empresa, tecnología..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          {locations.length > 1 && (
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Todas las ubicaciones</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-2 text-[#1F4E79]/50">
            <Loader2 className="h-5 w-5 animate-spin" /> Cargando búsquedas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-[#1F4E79]/50 dark:text-gray-500">
              {jobs.length === 0 ? "No hay búsquedas activas en este momento." : "Sin resultados para tu búsqueda."}
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link
                  href={`/busquedas/${job.slug || job.id}`}
                  className="block rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2EC4B6]/10 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[#0B1F3B] dark:text-white">{job.title}</h2>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Activa
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#1F4E79]/60 dark:text-gray-400">{job.company}</p>
                    </div>
                    <span className="rounded-full bg-[#2EC4B6]/10 px-3 py-1 text-xs font-semibold text-[#2EC4B6]">
                      {typeLabels[job.type] || job.type}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-[#1F4E79]/70 dark:text-gray-400">{job.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#1F4E79]/60 dark:text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {typeLabels[job.type] || job.type}</span>
                  </div>

                  {job.tags && job.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#0B1F3B]/5 px-2.5 py-0.5 text-[10px] font-medium text-[#1F4E79] dark:bg-white/10 dark:text-gray-300">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[#1F4E79]/40 dark:text-gray-600">
          {filtered.length} búsqueda{filtered.length !== 1 ? "s" : ""} activa{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
