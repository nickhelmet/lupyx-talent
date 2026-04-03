"use client";

import { useEffect, useState } from "react";
import { Database, HardDrive, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { adminFetch } from "@/services/adminApi";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonGrid } from "@/components/Skeleton";

interface UsageData {
  firestore: { totalJobs: number; totalApplications: number; totalUsers: number; rateLimitEntries: number };
  storage: { files: number; bytesUsed: number; mbUsed: number };
  gemini: { analyzedCvs: number };
  applicationsByDay: Record<string, number>;
  statusDistribution: Record<string, number>;
  jobsDistribution: Record<string, number>;
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Activas", PAUSED: "Pausadas", CLOSED: "Cerradas",
  PENDING: "Pendiente", REVIEWING: "En revisión", INTERVIEW: "Entrevista",
  ACCEPTED: "Aceptada", REJECTED: "Rechazada", HIRED: "Contratado",
};

export default function UsagePage() {
  const { user } = useAuth();
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    adminFetch("adminUsage")
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  if (loading) return <SkeletonGrid />;
  if (!data) return <p className="text-sm text-[#1F4E79]/50">Error cargando datos de uso.</p>;

  return (
    <div className="space-y-8">
      {/* Firestore */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
          <Database className="h-4 w-4 text-[#4FA3D1]" /> Firestore
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Búsquedas", value: data.firestore.totalJobs },
            { label: "Postulaciones", value: data.firestore.totalApplications },
            { label: "Usuarios", value: data.firestore.totalUsers },
            { label: "Rate limit entries", value: data.firestore.rateLimitEntries },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{s.value}</p>
              <p className="text-xs text-[#1F4E79]/60 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Storage + Gemini */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <HardDrive className="h-4 w-4 text-[#2EC4B6]" /> Storage
          </h2>
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{data.storage.mbUsed} MB</p>
            <p className="text-xs text-[#1F4E79]/60 dark:text-gray-400">{data.storage.files} archivos (CVs)</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-[#2EC4B6]" style={{ width: `${Math.min(data.storage.mbUsed / 50, 100)}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-[#1F4E79]/40">de 5 GB free tier</p>
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <Sparkles className="h-4 w-4 text-purple-500" /> Gemini AI
          </h2>
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{data.gemini.analyzedCvs}</p>
            <p className="text-xs text-[#1F4E79]/60 dark:text-gray-400">CVs analizados</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min(data.gemini.analyzedCvs / 15, 100)}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-[#1F4E79]/40">de 1500 requests/día free tier</p>
          </div>
        </div>
      </div>

      {/* Applications by day */}
      {Object.keys(data.applicationsByDay).length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <BarChart3 className="h-4 w-4 text-[#4FA3D1]" /> Postulaciones (últimos 7 días)
          </h2>
          <div className="mt-3 flex items-end gap-2">
            {Object.entries(data.applicationsByDay).sort().map(([day, count]) => {
              const maxCount = Math.max(...Object.values(data.applicationsByDay));
              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-[#0B1F3B] dark:text-white">{count}</span>
                  <div className="w-full rounded-t-lg bg-[#2EC4B6]" style={{ height: `${Math.max((count / maxCount) * 80, 8)}px` }} />
                  <span className="text-[10px] text-[#1F4E79]/50">{day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Jobs + Status distributions */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <TrendingUp className="h-4 w-4 text-[#2EC4B6]" /> Búsquedas por estado
          </h2>
          <div className="mt-3 space-y-2">
            {Object.entries(data.jobsDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <span className="text-xs text-[#1F4E79]/70 dark:text-gray-400">{statusLabels[status] || status}</span>
                <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <TrendingUp className="h-4 w-4 text-[#4FA3D1]" /> Postulaciones por estado
          </h2>
          <div className="mt-3 space-y-2">
            {Object.entries(data.statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <span className="text-xs text-[#1F4E79]/70 dark:text-gray-400">{statusLabels[status] || status}</span>
                <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[#1F4E79]/30 dark:text-gray-600">
        Para métricas detalladas de tráfico, visitá{" "}
        <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[#2EC4B6] hover:underline">Google Analytics</a>
      </p>
    </div>
  );
}
