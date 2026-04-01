"use client";

import { useEffect, useState } from "react";
import { Briefcase, FileText, Users, Clock, Loader2 } from "lucide-react";
import { adminFetch } from "@/services/adminApi";

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await adminFetch("adminDashboard");
        if (!cancelled) setStats(data);
      } catch {
        // Fallback to zeros
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const cards = [
    { label: "Búsquedas activas", value: stats?.activeJobs ?? 0, icon: Briefcase, color: "text-[#2EC4B6]", bg: "bg-[#2EC4B6]/10" },
    { label: "Postulaciones totales", value: stats?.totalApplications ?? 0, icon: FileText, color: "text-[#4FA3D1]", bg: "bg-[#4FA3D1]/10" },
    { label: "Pendientes de revisión", value: stats?.pendingApplications ?? 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Usuarios registrados", value: stats?.totalUsers ?? 0, icon: Users, color: "text-[#1F4E79]", bg: "bg-[#1F4E79]/10" },
  ];

  return (
    <div>
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-[#1F4E79]/50 dark:text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando datos...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{c.value}</p>
            <p className="mt-1 text-sm text-[#1F4E79]/60 dark:text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
