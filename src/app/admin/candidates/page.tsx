"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X, Loader2, Trash2, Tag, ChevronDown, ChevronUp, Briefcase, Download, GraduationCap, Globe, User } from "lucide-react";
import { adminFetch } from "@/services/adminApi";
import Pagination from "@/components/Pagination";
import { SkeletonList } from "@/components/Skeleton";
import { timeAgo } from "@/lib/utils";

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  linkedin: "LinkedIn",
  referral: "Referido",
  import: "Importación",
  website: "Sitio web",
  application: "Postulación",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWING: "En revisión",
  INTERVIEW: "Entrevista",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  HIRED: "Contratado",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  REVIEWING: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  INTERVIEW: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  ACCEPTED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  REJECTED: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  HIRED: "bg-[#2EC4B6]/10 text-[#2EC4B6]",
};

const educationLabels: Record<string, string> = {
  PRIMARY: "Primario",
  SECONDARY: "Secundario",
  TERTIARY: "Terciario",
  UNIVERSITY: "Universitario",
  POSTGRADUATE: "Posgrado",
  MASTER: "Maestría",
  PHD: "Doctorado",
};

interface CandidateApp {
  id: string;
  jobTitle: string;
  jobCompany: string;
  status: string;
  appliedAt: string | { _seconds: number };
  educationLevel?: string;
  dni?: string;
  birthDate?: string;
  address?: string;
  coverLetter?: string;
  cvPath?: string;
  cvAnalysis?: {
    summary?: string;
    skills?: string[];
    seniority_level?: string;
    total_years_experience?: number;
    languages?: Array<string | { language: string; level: string }>;
    job_match?: { score: number };
  };
  scores?: Record<string, number>;
}

interface UserProfile {
  summary?: string;
  skills?: string[];
  languages?: string[];
  educationLevel?: string;
  image?: string;
}

interface EnrichedCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  skills: string[];
  notes?: string | null;
  tags: string[];
  source: string;
  cvPath?: string | null;
  matchHistory: unknown[];
  createdAt: string;
  applications?: CandidateApp[];
  userProfile?: UserProfile;
}

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState<EnrichedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;

  async function loadCandidates() {
    try {
      setError(null);
      const data = await adminFetch("listCandidates");
      setCandidates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading candidates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadCandidates, 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await adminFetch("addCandidate", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          phone: form.get("phone"),
          city: form.get("city"),
          skills: (form.get("skills") as string)?.split(",").map((s) => s.trim()).filter(Boolean) || [],
          notes: form.get("notes"),
          tags: (form.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [],
          source: form.get("source") || "manual",
        }),
      });
      setShowForm(false);
      await loadCandidates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error adding candidate");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar candidato "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await adminFetch("deleteCandidate", {
        method: "POST",
        body: JSON.stringify({ candidateId: id }),
      });
      await loadCandidates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error deleting candidate");
    } finally {
      setDeleting(null);
    }
  }

  // Merge skills from candidate + profile + CV analysis
  function getAllSkills(c: EnrichedCandidate): string[] {
    const set = new Set<string>();
    (c.skills || []).forEach((s) => set.add(s));
    (c.userProfile?.skills || []).forEach((s) => set.add(s));
    (c.applications || []).forEach((app) => {
      (app.cvAnalysis?.skills || []).forEach((s) => set.add(s));
    });
    return [...set];
  }

  const allTags = [...new Set(candidates.flatMap((c) => c.tags || []))].sort();

  const filtered = candidates.filter((c) => {
    if (filterTag && !(c.tags || []).includes(filterTag)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const allSkills = getAllSkills(c);
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      allSkills.some((s) => s.toLowerCase().includes(q))
    );
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <SkeletonList count={5} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#0B1F3B] dark:text-white">Candidatos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-[#2EC4B6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#26a89c]"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Agregar candidato"}
        </button>
      </div>

      {/* Add candidate form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 rounded-xl border border-[#2EC4B6]/20 bg-[#2EC4B6]/5 p-5 dark:bg-[#2EC4B6]/5">
          <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Nuevo candidato</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input name="firstName" required placeholder="Nombre *" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="lastName" required placeholder="Apellido *" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="email" type="email" placeholder="Email" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="phone" placeholder="Teléfono" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="city" placeholder="Ciudad" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <select name="source" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="manual">Manual</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referido</option>
              <option value="import">Importación</option>
              <option value="website">Sitio web</option>
            </select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input name="skills" placeholder="Skills (separados por coma)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="tags" placeholder="Tags (separados por coma)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <textarea name="notes" rows={3} placeholder="Notas..." className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
          <div className="mt-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#2EC4B6] px-6 py-2 text-sm font-semibold text-white hover:bg-[#26a89c] disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar candidato
            </button>
          </div>
        </form>
      )}

      {/* Search and filters */}
      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre, email, ciudad, skills..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <span className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{filtered.length} candidatos</span>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => { setFilterTag(""); setPage(1); }}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filterTag ? "bg-[#2EC4B6] text-white" : "bg-gray-100 text-[#1F4E79]/60 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400"}`}
          >
            Todos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setFilterTag(filterTag === tag ? "" : tag); setPage(1); }}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterTag === tag ? "bg-[#2EC4B6] text-white" : "bg-gray-100 text-[#1F4E79]/60 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400"}`}
            >
              <Tag className="mr-1 inline h-3 w-3" />{tag}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}

      {/* Candidates list */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#1F4E79]/50 dark:text-gray-500">
            {candidates.length === 0 ? "No hay candidatos en la base de datos." : "Sin resultados para tu búsqueda."}
          </p>
        )}
        {paginated.map((c) => {
          const allSkills = getAllSkills(c);
          const latestApp = c.applications?.[0];
          const cvAnalysis = c.applications?.find((a) => a.cvAnalysis)?.cvAnalysis;

          return (
            <div key={c.id} className="rounded-xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/5">
              {/* Header — clickable */}
              <div
                className="flex cursor-pointer items-start justify-between p-4"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                      {c.firstName} {c.lastName}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-[#1F4E79]/60 dark:bg-white/10 dark:text-gray-400">
                      {sourceLabels[c.source] || c.source}
                    </span>
                    {cvAnalysis?.seniority_level && (
                      <span className="rounded-full bg-[#1F4E79]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1F4E79] dark:bg-white/10 dark:text-[#4FA3D1]">
                        {cvAnalysis.seniority_level}
                      </span>
                    )}
                    {expanded === c.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                  <p className="mt-0.5 text-sm text-[#1F4E79]/60 dark:text-gray-400">
                    {c.email && (
                      <span
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.email!); }}
                        className="cursor-pointer hover:text-[#2EC4B6]"
                        title="Click para copiar email"
                      >{c.email}</span>
                    )}
                    {c.email && c.phone && " · "}
                    {c.phone}
                    {c.city && <span className="text-[#1F4E79]/40 dark:text-gray-600"> · {c.city}</span>}
                  </p>

                  {/* Skills preview */}
                  {allSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {allSkills.slice(0, 8).map((s, i) => (
                        <span key={i} className="rounded-full bg-[#4FA3D1]/10 px-2 py-0.5 text-[11px] font-medium text-[#1F4E79] dark:bg-[#4FA3D1]/20 dark:text-[#4FA3D1]">{s}</span>
                      ))}
                      {allSkills.length > 8 && (
                        <span className="text-[11px] text-[#1F4E79]/40 dark:text-gray-500">+{allSkills.length - 8}</span>
                      )}
                    </div>
                  )}

                  {/* Applications summary (collapsed) */}
                  {c.applications && c.applications.length > 0 && expanded !== c.id && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {c.applications.map((app) => (
                        <span key={app.id} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[app.status] || ""}`}>
                          {app.jobTitle} — {statusLabels[app.status] || app.status}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id, `${c.firstName} ${c.lastName}`); }}
                  disabled={deleting === c.id}
                  className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                  title="Eliminar candidato"
                >
                  {deleting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>

              {/* Expanded detail */}
              {expanded === c.id && (
                <div className="border-t border-gray-100 p-4 dark:border-white/10">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left column: profile + personal data */}
                    <div className="space-y-4">
                      {/* User profile summary */}
                      {c.userProfile?.summary && (
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">
                            <User className="h-3.5 w-3.5" /> Resumen del perfil
                          </p>
                          <p className="mt-1 text-sm text-[#0B1F3B] dark:text-gray-200">{c.userProfile.summary}</p>
                        </div>
                      )}

                      {/* CV Analysis summary */}
                      {cvAnalysis?.summary && (
                        <div>
                          <p className="text-xs font-semibold text-[#2EC4B6]">Resumen CV (Gemini)</p>
                          <p className="mt-1 text-sm text-[#0B1F3B] dark:text-gray-200">{cvAnalysis.summary}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {cvAnalysis.seniority_level && (
                              <div>
                                <p className="text-[10px] text-[#1F4E79]/50 dark:text-gray-500">Seniority</p>
                                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{cvAnalysis.seniority_level}</p>
                              </div>
                            )}
                            {cvAnalysis.total_years_experience != null && (
                              <div>
                                <p className="text-[10px] text-[#1F4E79]/50 dark:text-gray-500">Años de exp.</p>
                                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{cvAnalysis.total_years_experience}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* All skills */}
                      {allSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">Skills</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {allSkills.map((s, i) => (
                              <span key={i} className="rounded-full bg-[#4FA3D1]/10 px-2.5 py-0.5 text-xs font-medium text-[#1F4E79] dark:bg-[#4FA3D1]/20 dark:text-[#4FA3D1]">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {((c.userProfile?.languages && c.userProfile.languages.length > 0) || (cvAnalysis?.languages && cvAnalysis.languages.length > 0)) && (
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">
                            <Globe className="h-3.5 w-3.5" /> Idiomas
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {(cvAnalysis?.languages || c.userProfile?.languages || []).map((lang, i) => (
                              <p key={i} className="text-sm text-[#0B1F3B] dark:text-gray-200">
                                {typeof lang === "string" ? lang : <><strong>{lang.language}</strong> — {lang.level}</>}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Personal data from latest application */}
                      {latestApp && (
                        <div>
                          <p className="text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">Datos personales</p>
                          <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                            {latestApp.educationLevel && (
                              <div>
                                <span className="text-[10px] text-[#1F4E79]/40 dark:text-gray-600">Educación</span>
                                <p className="flex items-center gap-1 text-[#0B1F3B] dark:text-white">
                                  <GraduationCap className="h-3.5 w-3.5 text-[#1F4E79]/40" />
                                  {educationLabels[latestApp.educationLevel] || latestApp.educationLevel}
                                </p>
                              </div>
                            )}
                            {latestApp.dni && (
                              <div>
                                <span className="text-[10px] text-[#1F4E79]/40 dark:text-gray-600">DNI</span>
                                <p className="text-[#0B1F3B] dark:text-white">{latestApp.dni}</p>
                              </div>
                            )}
                            {latestApp.birthDate && (
                              <div>
                                <span className="text-[10px] text-[#1F4E79]/40 dark:text-gray-600">Nacimiento</span>
                                <p className="text-[#0B1F3B] dark:text-white">{latestApp.birthDate}</p>
                              </div>
                            )}
                            {latestApp.address && (
                              <div>
                                <span className="text-[10px] text-[#1F4E79]/40 dark:text-gray-600">Dirección</span>
                                <p className="text-[#0B1F3B] dark:text-white">{latestApp.address}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {c.tags && c.tags.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">Tags</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {c.tags.map((t, i) => (
                              <span key={i} className="rounded-full bg-[#2EC4B6]/10 px-2 py-0.5 text-[10px] font-medium text-[#2EC4B6]">
                                <Tag className="mr-0.5 inline h-2.5 w-2.5" />{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {c.notes && (
                        <div>
                          <p className="text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">Notas</p>
                          <p className="mt-1 text-sm text-[#1F4E79]/70 dark:text-gray-400">{c.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right column: applications history */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">
                        <Briefcase className="h-3.5 w-3.5" /> Postulaciones ({c.applications?.length || 0})
                      </p>

                      {c.applications && c.applications.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {c.applications.map((app) => (
                            <div key={app.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{app.jobTitle}</p>
                                  <p className="text-xs text-[#1F4E79]/50 dark:text-gray-500">
                                    {app.jobCompany}{app.appliedAt && <> · {timeAgo(app.appliedAt as string)}</>}
                                  </p>
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[app.status] || ""}`}>
                                  {statusLabels[app.status] || app.status}
                                </span>
                              </div>

                              {/* Match score */}
                              {app.cvAnalysis?.job_match && (
                                <div className="mt-2">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    app.cvAnalysis.job_match.score >= 75 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                    app.cvAnalysis.job_match.score >= 50 ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                                    "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                  }`}>Match: {app.cvAnalysis.job_match.score}%</span>
                                </div>
                              )}

                              {/* Cover letter preview */}
                              {app.coverLetter && (
                                <p className="mt-2 text-xs text-[#1F4E79]/50 dark:text-gray-500 line-clamp-2">{app.coverLetter}</p>
                              )}

                              {/* CV download */}
                              {app.cvPath && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const auth = (await import("@/lib/firebase")).getFirebaseAuth();
                                      const token = await auth.currentUser?.getIdToken();
                                      const res = await fetch("https://us-central1-lupyx-talent.cloudfunctions.net/downloadCv", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ path: app.cvPath }),
                                      });
                                      if (!res.ok) throw new Error("Download failed");
                                      const blob = await res.blob();
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement("a");
                                      a.href = url;
                                      a.download = `CV-${c.firstName}_${c.lastName}.pdf`;
                                      a.click();
                                      URL.revokeObjectURL(url);
                                    } catch {
                                      setError("Error al descargar CV");
                                    }
                                  }}
                                  className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1F4E79]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#1F4E79] hover:bg-[#1F4E79]/20 dark:bg-white/10 dark:text-gray-300"
                                >
                                  <Download className="h-3 w-3" /> CV
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-[#1F4E79]/40 dark:text-gray-600">
                          {c.source === "application" ? "Datos de postulación no disponibles." : "Sin postulaciones — candidato cargado manualmente."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Pagination total={filtered.length} page={page} perPage={perPage} onPageChange={setPage} />
    </div>
  );
}
