"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Plus, Edit, Loader2, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { adminFetch } from "@/services/adminApi";
import type { Job, Application } from "@/types";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  PAUSED: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  CLOSED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  async function loadJobs() {
    try {
      setError(null);
      const [jobsData, appsData] = await Promise.all([
        adminFetch("adminListJobs"),
        adminFetch("adminListApplications").catch(() => []),
      ]);
      setJobs(jobsData);
      const counts: Record<string, number> = {};
      (appsData as Application[]).forEach((a) => {
        const key = a.jobTitle || "";
        counts[key] = (counts[key] || 0) + 1;
      });
      setAppCounts(counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadJobs, 500);
    return () => clearTimeout(timer);
  }, []);

  async function toggleStatus(jobId: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setActionLoading(jobId);
    try {
      await adminFetch("updateJobStatus", {
        method: "POST",
        body: JSON.stringify({ jobId, status: newStatus }),
      });
      await loadJobs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error updating status");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#1F4E79]/50 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando búsquedas...
      </div>
    );
  }

  const filtered = jobs.filter((j) => {
    if (filterStatus && j.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar puesto, empresa..."
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activas</option>
            <option value="PAUSED">Pausadas</option>
            <option value="CLOSED">Cerradas</option>
          </select>
          <span className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{filtered.length} búsquedas</span>
        </div>
        <Link
          href="/admin/jobs/new"
          className="flex items-center gap-2 rounded-full bg-[#2EC4B6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#26a89c]"
        >
          <Plus className="h-4 w-4" /> Nueva búsqueda
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#1F4E79]/50 dark:text-gray-500 py-8">
            {jobs.length === 0 ? "No hay búsquedas creadas todavía." : "Sin resultados para los filtros seleccionados."}
          </p>
        )}
        {filtered.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{job.title}</h3>
                {appCounts[job.title] > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-[#4FA3D1]/10 px-2 py-0.5 text-xs font-semibold text-[#4FA3D1]">
                    <Users className="h-3 w-3" /> {appCounts[job.title]}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-[#1F4E79]/60 dark:text-gray-400">
                {job.company} · {job.location} · {job.postedDate?.split("T")[0]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status] || ""}`}>
                {job.status}
              </span>
              <Link
                href={`/admin/jobs/${job.slug || job.id}`}
                className="text-[#1F4E79]/40 hover:text-[#2EC4B6] dark:text-gray-500"
                aria-label="Editar"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                onClick={() => toggleStatus(job.slug || job.id, job.status)}
                disabled={actionLoading === (job.slug || job.id)}
                className="text-[#1F4E79]/40 hover:text-[#2EC4B6] dark:text-gray-500 disabled:opacity-50"
                aria-label={job.status === "ACTIVE" ? "Pausar" : "Activar"}
              >
                {actionLoading === (job.slug || job.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : job.status === "ACTIVE" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              {job.status !== "CLOSED" && (
                <button
                  onClick={async () => {
                    if (!confirm(`¿Cerrar la búsqueda "${job.title}"? No se eliminará, quedará archivada.`)) return;
                    setActionLoading(job.slug || job.id);
                    try {
                      await adminFetch("updateJobStatus", {
                        method: "POST",
                        body: JSON.stringify({ jobId: job.slug || job.id, status: "CLOSED" }),
                      });
                      await loadJobs();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Error");
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  className="text-[#1F4E79]/40 hover:text-red-500 dark:text-gray-500"
                  aria-label="Cerrar búsqueda"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
