"use client";

import { useEffect, useState } from "react";
import { Briefcase, FileText, Users, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SkeletonGrid, SkeletonList } from "@/components/Skeleton";
import { adminFetch } from "@/services/adminApi";
import { useAuth } from "@/hooks/useAuth";
import type { Application } from "@/types";

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalUsers: number;
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWING: "En revisión",
  INTERVIEW: "Entrevista",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  HIRED: "Contratado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500",
  REVIEWING: "bg-blue-500",
  INTERVIEW: "bg-purple-500",
  ACCEPTED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  HIRED: "bg-[#2EC4B6]",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const [statsData, appsData] = await Promise.all([
          adminFetch("adminDashboard"),
          adminFetch("adminListApplications").catch(() => []),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setRecentApps((appsData as Application[]).slice(0, 5));
        }
      } catch {
        // Fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [user]);

  // Status distribution
  const statusDist: Record<string, number> = {};
  recentApps.forEach((a) => {
    statusDist[a.status] = (statusDist[a.status] || 0) + 1;
  });

  const cards = [
    { label: "Búsquedas activas", value: stats?.activeJobs ?? 0, icon: Briefcase, color: "text-[#2EC4B6]", bg: "bg-[#2EC4B6]/10", href: "/admin/jobs" },
    { label: "Postulaciones totales", value: stats?.totalApplications ?? 0, icon: FileText, color: "text-[#4FA3D1]", bg: "bg-[#4FA3D1]/10", href: "/admin/applications" },
    { label: "Pendientes de revisión", value: stats?.pendingApplications ?? 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", href: "/admin/applications" },
    { label: "Usuarios registrados", value: stats?.totalUsers ?? 0, icon: Users, color: "text-[#1F4E79]", bg: "bg-[#1F4E79]/10", href: "/admin/users" },
  ];

  return (
    <div>
      {loading ? (
        <div className="space-y-8">
          <SkeletonGrid />
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonList count={4} />
            <SkeletonList count={4} />
          </div>
        </div>
      ) : (<>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{c.value}</p>
            <p className="mt-1 text-sm text-[#1F4E79]/60 dark:text-gray-400">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Status distribution */}
        {Object.keys(statusDist).length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
              <TrendingUp className="h-4 w-4 text-[#2EC4B6]" /> Distribución por estado
            </h2>
            <div className="mt-4 space-y-3">
              {Object.entries(statusDist).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${statusColors[status] || "bg-gray-400"}`} />
                  <span className="flex-1 text-sm text-[#1F4E79]/70 dark:text-gray-400">{statusLabels[status] || status}</span>
                  <span className="text-sm font-semibold text-[#0B1F3B] dark:text-white">{count}</span>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full ${statusColors[status] || "bg-gray-400"}`}
                      style={{ width: `${Math.round((count / (stats?.totalApplications || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent applications */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <FileText className="h-4 w-4 text-[#4FA3D1]" /> Últimas postulaciones
          </h2>
          {recentApps.length === 0 ? (
            <p className="mt-4 text-sm text-[#1F4E79]/50 dark:text-gray-500">Sin postulaciones aún.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{app.firstName} {app.lastName}</p>
                    <p className="text-xs text-[#1F4E79]/50 dark:text-gray-500">{app.jobTitle}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    app.status === "PENDING" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                    app.status === "HIRED" ? "bg-[#2EC4B6]/10 text-[#2EC4B6]" :
                    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {statusLabels[app.status] || app.status}
                  </span>
                </div>
              ))}
              <Link href="/admin/applications" className="mt-2 block text-xs font-semibold text-[#2EC4B6] hover:underline">
                Ver todas →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Conversion metrics */}
      {stats && stats.totalApplications > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <TrendingUp className="h-4 w-4 text-[#2EC4B6]" /> Métricas de conversión
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
                {stats.totalApplications > 0 ? Math.round(((statusDist["INTERVIEW"] || 0) / stats.totalApplications) * 100) : 0}%
              </p>
              <p className="mt-1 text-xs text-[#1F4E79]/60 dark:text-gray-400">Llegan a entrevista</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${stats.totalApplications > 0 ? ((statusDist["INTERVIEW"] || 0) / stats.totalApplications) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
                {stats.totalApplications > 0 ? Math.round((((statusDist["ACCEPTED"] || 0) + (statusDist["HIRED"] || 0)) / stats.totalApplications) * 100) : 0}%
              </p>
              <p className="mt-1 text-xs text-[#1F4E79]/60 dark:text-gray-400">Aceptados / Contratados</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.totalApplications > 0 ? (((statusDist["ACCEPTED"] || 0) + (statusDist["HIRED"] || 0)) / stats.totalApplications) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
                {stats.totalApplications > 0 ? Math.round(((statusDist["REJECTED"] || 0) / stats.totalApplications) * 100) : 0}%
              </p>
              <p className="mt-1 text-xs text-[#1F4E79]/60 dark:text-gray-400">Rechazados</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${stats.totalApplications > 0 ? ((statusDist["REJECTED"] || 0) / stats.totalApplications) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
