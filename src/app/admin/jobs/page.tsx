"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Plus, Loader2 } from "lucide-react";
import { adminFetch } from "@/services/adminApi";
import type { Job } from "@/types";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  PAUSED: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  CLOSED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadJobs() {
    try {
      setError(null);
      const data = await adminFetch("listJobs");
      setJobs(data);
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{jobs.length} búsquedas</p>
        <a
          href="/admin/jobs/new"
          className="flex items-center gap-2 rounded-full bg-[#2EC4B6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#26a89c]"
        >
          <Plus className="h-4 w-4" /> Nueva búsqueda
        </a>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {jobs.length === 0 && (
          <p className="text-center text-sm text-[#1F4E79]/50 dark:text-gray-500 py-8">
            No hay búsquedas creadas todavía.
          </p>
        )}
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{job.title}</h3>
              <p className="mt-0.5 text-sm text-[#1F4E79]/60 dark:text-gray-400">
                {job.company} · {job.location} · {job.postedDate?.split("T")[0]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status] || ""}`}>
                {job.status}
              </span>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
