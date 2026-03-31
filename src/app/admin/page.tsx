"use client";

import { useState } from "react";
import { Briefcase, FileText, Users, Clock } from "lucide-react";

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalUsers: number;
}

const defaultStats: DashboardStats = {
  activeJobs: 2,
  totalApplications: 0,
  pendingApplications: 0,
  totalUsers: 0,
};

export default function AdminDashboard() {
  const [stats] = useState<DashboardStats>(defaultStats);

  const cards = [
    { label: "Búsquedas activas", value: stats.activeJobs, icon: Briefcase, color: "text-[#2EC4B6]", bg: "bg-[#2EC4B6]/10" },
    { label: "Postulaciones totales", value: stats.totalApplications, icon: FileText, color: "text-[#4FA3D1]", bg: "bg-[#4FA3D1]/10" },
    { label: "Pendientes de revisión", value: stats.pendingApplications, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Usuarios registrados", value: stats.totalUsers, icon: Users, color: "text-[#1F4E79]", bg: "bg-[#1F4E79]/10" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5"
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{c.value}</p>
            <p className="mt-1 text-sm text-[#1F4E79]/60 dark:text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">Últimas postulaciones</h2>
        <p className="mt-4 text-sm text-[#1F4E79]/50 dark:text-gray-500">
          No hay postulaciones todavía. Aparecerán acá cuando los candidatos apliquen.
        </p>
      </div>
    </div>
  );
}
