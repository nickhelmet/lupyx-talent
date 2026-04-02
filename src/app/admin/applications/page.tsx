"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, MessageSquare, ChevronDown, ChevronUp, Send, Sparkles, Download } from "lucide-react";
import { adminFetch } from "@/services/adminApi";
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

interface CvAnalysis {
  is_cv: boolean;
  summary?: string;
  skills?: string[];
  experience?: Array<{ company: string; position: string; period: string }>;
  education?: Array<{ institution: string; degree: string; year: string }>;
  languages?: string[];
  seniority_level?: string;
  total_years_experience?: number;
}

type AppWithComments = Application & {
  comments?: Comment[];
  cvAnalysis?: CvAnalysis;
  cvAnalyzedAt?: string;
};

export default function AdminApplications() {
  const [apps, setApps] = useState<AppWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentInternal, setCommentInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

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

  const filtered = apps.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.firstName?.toLowerCase().includes(q) ||
      a.lastName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.jobTitle?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#1F4E79]/50 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando postulaciones...
      </div>
    );
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

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#1F4E79]/50 dark:text-gray-500">
            {apps.length === 0 ? "No hay postulaciones todavía." : "Sin resultados."}
          </p>
        )}
        {filtered.map((app) => (
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

                {/* CV download */}
                {app.cvPath && (
                  <div className="mt-3">
                    <button
                      onClick={async () => {
                        try {
                          const { url } = await adminFetch("downloadCv", {
                            method: "POST",
                            body: JSON.stringify({ path: app.cvPath }),
                          });
                          window.open(url, "_blank");
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
                        <p className="text-xs text-[#1F4E79]/70 dark:text-gray-400">
                          Idiomas: {app.cvAnalysis.languages.join(", ")}
                        </p>
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
    </div>
  );
}
