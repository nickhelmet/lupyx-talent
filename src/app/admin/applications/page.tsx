"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
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

const statusOptions: ApplicationStatus[] = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED", "HIRED"];

export default function AdminApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
      setError(e instanceof Error ? e.message : "Error updating status");
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
        <span className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{filtered.length} resultados</span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#1F4E79]/50 dark:text-gray-500 py-8">
            {apps.length === 0 ? "No hay postulaciones todavía." : "Sin resultados para esta búsqueda."}
          </p>
        )}
        {filtered.map((app) => (
          <div
            key={app.id}
            className="rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                  {app.firstName} {app.lastName}
                </h3>
                <p className="mt-0.5 text-sm text-[#1F4E79]/60 dark:text-gray-400">
                  {app.email} · {app.jobTitle}
                </p>
                {app.phone && <p className="text-xs text-[#1F4E79]/40 dark:text-gray-500">{app.phone}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold outline-none cursor-pointer ${statusStyles[app.status] || ""}`}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            {app.coverLetter && (
              <p className="mt-2 text-sm text-[#1F4E79]/60 dark:text-gray-400 line-clamp-2">{app.coverLetter}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
