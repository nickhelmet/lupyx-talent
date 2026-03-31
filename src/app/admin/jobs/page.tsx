"use client";

import { useState } from "react";
import { Plus, Edit } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  location: string;
  postedDate: string;
}

const mockJobs: Job[] = [
  { id: "senior-backend-java", title: "Senior Backend Engineer", company: "Empresa confidencial", status: "ACTIVE", location: "Buenos Aires / Santa Fe", postedDate: "2026-03-29" },
  { id: "senior-marketing-designer", title: "Senior Marketing Designer", company: "Startup AI", status: "ACTIVE", location: "Remoto LATAM", postedDate: "2026-03-29" },
];

const statusStyles = {
  ACTIVE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  PAUSED: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  CLOSED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default function AdminJobs() {
  const [jobs] = useState<Job[]>(mockJobs);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{jobs.length} búsquedas</p>
        <button className="flex items-center gap-2 rounded-full bg-[#2EC4B6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#26a89c]">
          <Plus className="h-4 w-4" /> Nueva búsqueda
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{job.title}</h3>
              <p className="mt-0.5 text-sm text-[#1F4E79]/60 dark:text-gray-400">
                {job.company} · {job.location} · {job.postedDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status]}`}>
                {job.status}
              </span>
              <button className="text-[#1F4E79]/40 hover:text-[#2EC4B6] dark:text-gray-500" aria-label="Editar">
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
