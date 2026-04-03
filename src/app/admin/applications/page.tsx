"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, MessageSquare, ChevronDown, ChevronUp, Send, Sparkles, Download } from "lucide-react";
import { adminFetch } from "@/services/adminApi";
import Pagination from "@/components/Pagination";
import { timeAgo } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";
import type { Application, ApplicationStatus } from "@/types";

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

const statusFlow: ApplicationStatus[] = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED", "HIRED"];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500",
  REVIEWING: "bg-blue-500",
  INTERVIEW: "bg-purple-500",
  ACCEPTED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  HIRED: "bg-[#2EC4B6]",
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

interface Comment {
  text: string;
  isInternal: boolean;
  author: string;
  createdAt: string;
}

interface StatusEvent {
  from: string;
  to: string;
  changedBy: string;
  changedAt: string;
}

interface CvAnalysis {
  is_cv: boolean;
  summary?: string;
  skills?: string[];
  experience?: Array<{ company: string; position: string; period: string }>;
  education?: Array<{ institution: string; degree: string; year: string }>;
  languages?: Array<string | { language: string; level: string; certifications?: string }>;
  seniority_level?: string;
  total_years_experience?: number;
  job_match?: { score: number; meets?: string[]; missing?: string[]; notes?: string };
  better_fit_jobs?: Array<{ job_title: string; reason: string }>;
}

type AppWithComments = Application & {
  comments?: Comment[];
  cvAnalysis?: CvAnalysis;
  cvAnalyzedAt?: string;
  statusHistory?: StatusEvent[];
};

export default function AdminApplications() {
  const [apps, setApps] = useState<AppWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterJob, setFilterJob] = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentInternal, setCommentInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [interviewForm, setInterviewForm] = useState<string | null>(null);

  async function loadApps() {
    try {
      setError(null);
      const data = await adminFetch("adminListApplications");
      setApps(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadApps, 500);
    return () => clearTimeout(timer);
  }, []);

  async function updateStatus(appId: string, status: string) {
    try {
      await adminFetch("updateApplicationStatus", {
        method: "POST",
        body: JSON.stringify({ applicationId: appId, status }),
      });
      await loadApps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function runCvAnalysis(appId: string) {
    setAnalyzing(appId);
    try {
      await adminFetch("analyzeCv", {
        method: "POST",
        body: JSON.stringify({ applicationId: appId }),
      });
      await loadApps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error analyzing CV");
    } finally {
      setAnalyzing(null);
    }
  }

  async function sendComment(appId: string) {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await adminFetch("addComment", {
        method: "POST",
        body: JSON.stringify({ applicationId: appId, text: commentText, isInternal: commentInternal }),
      });
      setCommentText("");
      setCommentInternal(false);
      await loadApps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSending(false);
    }
  }

  const jobTitles = [...new Set(apps.map((a) => a.jobTitle).filter(Boolean))];

  const filtered = apps.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterJob && a.jobTitle !== filterJob) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.firstName?.toLowerCase().includes(q) ||
      a.lastName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.jobTitle?.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return <SkeletonList count={5} />;
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, puesto..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <span className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{filtered.length} postulaciones</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todos los estados</option>
          {statusFlow.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
        <select
          value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todas las búsquedas</option>
          {jobTitles.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
        {(filterStatus || filterJob) && (
          <button onClick={() => { setFilterStatus(""); setFilterJob(""); }} className="text-xs text-[#2EC4B6] hover:underline">
            Limpiar filtros
          </button>
        )}
        <button
          onClick={() => {
            const headers = "Nombre,Apellido,Email,Puesto,Estado,Teléfono,Ciudad,Fecha\n";
            const rows = filtered.map((a) =>
              `"${a.firstName || ""}","${a.lastName || ""}","${a.email || ""}","${a.jobTitle || ""}","${statusLabels[a.status] || a.status}","${a.phone || ""}","${a.city || ""}","${a.appliedAt || ""}"`
            ).join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const el = document.createElement("a");
            el.href = url; el.download = `postulaciones-${new Date().toISOString().split("T")[0]}.csv`; el.click();
            URL.revokeObjectURL(url);
          }}
          className="cursor-pointer text-xs font-medium text-[#1F4E79] hover:text-[#2EC4B6] dark:text-gray-400"
        >
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#1F4E79]/50 dark:text-gray-500">
            {apps.length === 0 ? "No hay postulaciones todavía." : "Sin resultados."}
          </p>
        )}
        {paginated.map((app) => (
          <div key={app.id} className="rounded-xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/5">
            {/* Header */}
            <div
              className="flex cursor-pointer items-start justify-between p-4"
              onClick={() => setExpanded(expanded === app.id ? null : app.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                    {app.firstName} {app.lastName}
                  </h3>
                  {expanded === app.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
                <p className="mt-0.5 text-sm text-[#1F4E79]/60 dark:text-gray-400">
                  {app.email} · {app.jobTitle}
                  {app.appliedAt && <span className="text-[#1F4E79]/40 dark:text-gray-600"> · {timeAgo(app.appliedAt as string)}</span>}
                </p>
              </div>
              <select
                value={app.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateStatus(app.id, e.target.value)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold outline-none ${statusStyles[app.status] || ""}`}
              >
                {statusFlow.map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
            </div>

            {/* Expanded detail */}
            {expanded === app.id && (
              <div className="border-t border-gray-100 p-4 dark:border-white/10">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-[#1F4E79]/50 dark:text-gray-500">Teléfono:</span>{" "}
                    <span className="text-[#0B1F3B] dark:text-white">{app.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#1F4E79]/50 dark:text-gray-500">Ciudad:</span>{" "}
                    <span className="text-[#0B1F3B] dark:text-white">{app.city || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#1F4E79]/50 dark:text-gray-500">DNI:</span>{" "}
                    <span className="text-[#0B1F3B] dark:text-white">{app.dni || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#1F4E79]/50 dark:text-gray-500">Educación:</span>{" "}
                    <span className="text-[#0B1F3B] dark:text-white">{educationLabels[app.educationLevel || ""] || app.educationLevel || "—"}</span>
                  </div>
                </div>

                {/* Status timeline */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">Historial</p>
                    <div className="mt-2 space-y-2">
                      {app.statusHistory.map((evt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#1F4E79]/60 dark:text-gray-500">
                          <div className={`h-2 w-2 rounded-full ${statusColors[evt.to] || "bg-gray-400"}`} />
                          <span>{statusLabels[evt.from] || evt.from} → <strong className="text-[#0B1F3B] dark:text-white">{statusLabels[evt.to] || evt.to}</strong></span>
                          <span className="text-[#1F4E79]/40">·</span>
                          <span>{evt.changedBy?.split("@")[0]}</span>
                          <span className="text-[#1F4E79]/40">·</span>
                          <span>{new Date(evt.changedAt).toLocaleDateString("es-AR")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CV download */}
                {app.cvPath && (
                  <div className="mt-3">
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
                          a.download = app.cvPath?.split("/").pop()?.replace(/^\d+-/, "") || `CV-${app.firstName}_${app.lastName}.pdf`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch {
                          setError("Error al descargar CV");
                        }
                      }}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1F4E79]/10 px-3 py-2 text-xs font-semibold text-[#1F4E79] transition-colors hover:bg-[#1F4E79]/20 dark:bg-white/10 dark:text-gray-300"
                    >
                      <Download className="h-3.5 w-3.5" /> Descargar CV
                    </button>
                  </div>
                )}

                {app.coverLetter && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">Carta de presentación</p>
                    <p className="mt-1 text-sm text-[#1F4E79]/80 dark:text-gray-300">{app.coverLetter}</p>
                  </div>
                )}

                {/* Schedule Interview */}
                {app.status === "INTERVIEW" && (
                  <div className="mt-4">
                    {interviewForm === app.id ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = new FormData(e.currentTarget);
                          try {
                            await adminFetch("manageInterviewRounds", {
                              method: "POST",
                              body: JSON.stringify({
                                applicationId: app.id,
                                type: form.get("type"),
                                scheduledDate: form.get("date"),
                                meetingLink: form.get("link"),
                                interviewerName: form.get("interviewer"),
                                roundNumber: 1,
                                status: "SCHEDULED",
                              }),
                            });
                            setInterviewForm(null);
                            await loadApps();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Error");
                          }
                        }}
                        className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20"
                      >
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Agendar entrevista</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <input name="date" type="datetime-local" required className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none dark:border-purple-700 dark:bg-white/5 dark:text-white" />
                          <select name="type" className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none dark:border-purple-700 dark:bg-white/5 dark:text-white">
                            <option value="VIDEO">Video</option>
                            <option value="PHONE">Teléfono</option>
                            <option value="PRESENTIAL">Presencial</option>
                            <option value="TECHNICAL">Técnica</option>
                          </select>
                          <input name="link" placeholder="Link de Meet/Zoom" className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none dark:border-purple-700 dark:bg-white/5 dark:text-white" />
                          <input name="interviewer" placeholder="Entrevistador" className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none dark:border-purple-700 dark:bg-white/5 dark:text-white" />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button type="submit" className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700">Agendar</button>
                          <button type="button" onClick={() => setInterviewForm(null)} className="text-xs text-purple-600 hover:underline">Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setInterviewForm(app.id)}
                        className="cursor-pointer text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                      >
                        + Agendar entrevista
                      </button>
                    )}
                  </div>
                )}

                {/* CV Analysis */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">
                      <Sparkles className="h-3.5 w-3.5" /> Análisis de CV (Gemini)
                    </p>
                    {app.cvPath && (
                      <button
                        onClick={() => runCvAnalysis(app.id)}
                        disabled={analyzing === app.id}
                        className="flex items-center gap-1.5 rounded-lg bg-[#1F4E79] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B1F3B] disabled:opacity-50"
                      >
                        {analyzing === app.id ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Analizando...</>
                        ) : app.cvAnalysis ? (
                          <><Sparkles className="h-3 w-3" /> Re-analizar</>
                        ) : (
                          <><Sparkles className="h-3 w-3" /> Analizar CV</>
                        )}
                      </button>
                    )}
                  </div>

                  {app.cvAnalysis ? (
                    <div className="mt-2 space-y-3 rounded-xl border border-[#2EC4B6]/20 bg-[#2EC4B6]/5 p-4">
                      {app.cvAnalysis.summary && (
                        <div>
                          <p className="text-xs font-semibold text-[#2EC4B6]">Resumen</p>
                          <p className="mt-1 text-sm text-[#0B1F3B] dark:text-gray-200">{app.cvAnalysis.summary}</p>
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {app.cvAnalysis.seniority_level && (
                          <div>
                            <p className="text-xs text-[#1F4E79]/50">Seniority</p>
                            <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{app.cvAnalysis.seniority_level}</p>
                          </div>
                        )}
                        {app.cvAnalysis.total_years_experience != null && (
                          <div>
                            <p className="text-xs text-[#1F4E79]/50">Años de experiencia</p>
                            <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{app.cvAnalysis.total_years_experience}</p>
                          </div>
                        )}
                      </div>
                      {app.cvAnalysis.skills && app.cvAnalysis.skills.length > 0 && (
                        <div>
                          <p className="text-xs text-[#1F4E79]/50">Skills</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {app.cvAnalysis.skills.map((s, i) => (
                              <span key={i} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-[#1F4E79] dark:bg-white/10 dark:text-gray-300">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {app.cvAnalysis.experience && app.cvAnalysis.experience.length > 0 && (
                        <div>
                          <p className="text-xs text-[#1F4E79]/50">Experiencia</p>
                          <div className="mt-1 space-y-1">
                            {app.cvAnalysis.experience.map((e, i) => (
                              <p key={i} className="text-sm text-[#0B1F3B] dark:text-gray-200">
                                <span className="font-medium">{e.position}</span> en {e.company} · {e.period}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {app.cvAnalysis.education && app.cvAnalysis.education.length > 0 && (
                        <div>
                          <p className="text-xs text-[#1F4E79]/50">Educación</p>
                          <div className="mt-1 space-y-1">
                            {app.cvAnalysis.education.map((e, i) => (
                              <p key={i} className="text-sm text-[#0B1F3B] dark:text-gray-200">
                                {e.degree} — {e.institution} {e.year && `(${e.year})`}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {app.cvAnalysis.languages && app.cvAnalysis.languages.length > 0 && (
                        <div>
                          <p className="text-xs text-[#1F4E79]/50">Idiomas</p>
                          <div className="mt-1 space-y-0.5">
                            {app.cvAnalysis.languages.map((lang: string | { language: string; level: string; certifications?: string }, i: number) => (
                              <p key={i} className="text-sm text-[#0B1F3B] dark:text-gray-200">
                                {typeof lang === "string" ? lang : (
                                  <><strong>{lang.language}</strong> — {lang.level}{lang.certifications ? ` (${lang.certifications})` : ""}</>
                                )}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {app.cvAnalysis.job_match && (
                        <div className="rounded-lg border border-[#2EC4B6]/20 bg-white p-3 dark:bg-white/5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-[#1F4E79]/50">Match con la búsqueda</p>
                            <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${
                              app.cvAnalysis.job_match.score >= 75 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                              app.cvAnalysis.job_match.score >= 50 ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                              "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            }`}>{app.cvAnalysis.job_match.score}%</span>
                          </div>
                          {app.cvAnalysis.job_match.meets && app.cvAnalysis.job_match.meets.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] font-semibold text-emerald-600">Cumple:</p>
                              {app.cvAnalysis.job_match.meets.map((m: string, i: number) => (
                                <p key={i} className="text-xs text-[#1F4E79]/70 dark:text-gray-400">✓ {m}</p>
                              ))}
                            </div>
                          )}
                          {app.cvAnalysis.job_match.missing && app.cvAnalysis.job_match.missing.length > 0 && (
                            <div className="mt-1">
                              <p className="text-[10px] font-semibold text-red-500">No cumple:</p>
                              {app.cvAnalysis.job_match.missing.map((m: string, i: number) => (
                                <p key={i} className="text-xs text-[#1F4E79]/70 dark:text-gray-400">✗ {m}</p>
                              ))}
                            </div>
                          )}
                          {app.cvAnalysis.job_match.notes && (
                            <p className="mt-1 text-xs italic text-[#1F4E79]/50 dark:text-gray-500">{app.cvAnalysis.job_match.notes}</p>
                          )}
                        </div>
                      )}
                      {app.cvAnalysis.better_fit_jobs && app.cvAnalysis.better_fit_jobs.length > 0 && (
                        <div>
                          <p className="text-xs text-[#1F4E79]/50">Podría encajar mejor en:</p>
                          {app.cvAnalysis.better_fit_jobs.map((j: { job_title: string; reason: string }, i: number) => (
                            <p key={i} className="text-xs text-[#1F4E79]/70 dark:text-gray-400">→ <strong>{j.job_title}</strong>: {j.reason}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : app.cvPath ? (
                    <p className="mt-2 text-xs text-[#1F4E79]/40 dark:text-gray-600">CV disponible — presioná Analizar CV para obtener el resumen.</p>
                  ) : (
                    <p className="mt-2 text-xs text-[#1F4E79]/40 dark:text-gray-600">Sin CV adjunto.</p>
                  )}
                </div>

                {/* Comments */}
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79]/50 dark:text-gray-500">
                    <MessageSquare className="h-3.5 w-3.5" /> Comentarios
                  </p>
                  {app.comments && app.comments.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {app.comments.map((c, i) => (
                        <div
                          key={i}
                          className={`rounded-lg p-3 text-sm ${
                            c.isInternal
                              ? "border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                              : "bg-gray-50 dark:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs text-[#1F4E79]/50 dark:text-gray-500">
                            <span>{c.author}</span>
                            <span>·</span>
                            <span>{new Date(c.createdAt).toLocaleDateString("es-AR")}</span>
                            {c.isInternal && <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">INTERNO</span>}
                          </div>
                          <p className="mt-1 text-[#0B1F3B] dark:text-gray-200">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[#1F4E79]/40 dark:text-gray-600">Sin comentarios</p>
                  )}

                  {/* Add comment */}
                  <div className="mt-3 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escribir comentario..."
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendComment(app.id)}
                    />
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[#1F4E79]/60 dark:text-gray-400">
                      <input type="checkbox" checked={commentInternal} onChange={(e) => setCommentInternal(e.target.checked)} className="rounded" />
                      Interno
                    </label>
                    <button
                      onClick={() => sendComment(app.id)}
                      disabled={sending || !commentText.trim()}
                      className="flex items-center gap-1 rounded-lg bg-[#2EC4B6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#26a89c] disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination total={filtered.length} page={page} perPage={perPage} onPageChange={setPage} />
    </div>
  );
}
