"use client";

import { useState, useRef } from "react";
import { Clock, FileText, Sparkles, GripVertical } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const statusFlow: ApplicationStatus[] = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED", "HIRED"];

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWING: "En revisión",
  INTERVIEW: "Entrevista",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  HIRED: "Contratado",
};

const columnColors: Record<string, { border: string; bg: string; dot: string }> = {
  PENDING: { border: "border-amber-300 dark:border-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10", dot: "bg-amber-500" },
  REVIEWING: { border: "border-blue-300 dark:border-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", dot: "bg-blue-500" },
  INTERVIEW: { border: "border-purple-300 dark:border-purple-600", bg: "bg-purple-50 dark:bg-purple-900/10", dot: "bg-purple-500" },
  ACCEPTED: { border: "border-emerald-300 dark:border-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10", dot: "bg-emerald-500" },
  REJECTED: { border: "border-red-300 dark:border-red-600", bg: "bg-red-50 dark:bg-red-900/10", dot: "bg-red-500" },
  HIRED: { border: "border-[#2EC4B6] dark:border-[#2EC4B6]", bg: "bg-[#2EC4B6]/5", dot: "bg-[#2EC4B6]" },
};

interface KanbanApp {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  jobCompany?: string;
  status: ApplicationStatus;
  appliedAt?: string | { _seconds: number };
  cvPath?: string;
  cvAnalysis?: { job_match?: { score: number }; seniority_level?: string };
}

interface Props {
  apps: KanbanApp[];
  filterJob: string;
  onStatusChange: (appId: string, newStatus: string) => Promise<void>;
  onCardClick: (appId: string) => void;
}

export default function KanbanBoard({ apps, filterJob, onStatusChange, onCardClick }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);

  const filtered = filterJob ? apps.filter((a) => a.jobTitle === filterJob) : apps;

  function onDragStart(e: React.DragEvent, appId: string) {
    dragRef.current = appId;
    setDragging(appId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appId);
  }

  function onDragEnd() {
    setDragging(null);
    setDragOver(null);
    dragRef.current = null;
  }

  function onColumnDragOver(e: React.DragEvent, status: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(status);
  }

  function onColumnDragLeave() {
    setDragOver(null);
  }

  async function onDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    setDragOver(null);
    const appId = dragRef.current;
    if (!appId) return;

    const app = apps.find((a) => a.id === appId);
    if (!app || app.status === newStatus) return;

    setUpdating(appId);
    try {
      await onStatusChange(appId, newStatus);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "60vh" }}>
      {statusFlow.map((status) => {
        const columnApps = filtered.filter((a) => a.status === status);
        const colors = columnColors[status];
        const isOver = dragOver === status;

        return (
          <div
            key={status}
            className={`flex w-64 min-w-[16rem] shrink-0 flex-col rounded-xl border-2 transition-colors ${
              isOver ? `${colors.border} ${colors.bg}` : "border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.02]"
            }`}
            onDragOver={(e) => onColumnDragOver(e, status)}
            onDragLeave={onColumnDragLeave}
            onDrop={(e) => onDrop(e, status)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 dark:border-white/10">
              <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
              <span className="text-xs font-semibold text-[#0B1F3B] dark:text-white">{statusLabels[status]}</span>
              <span className="ml-auto rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-[#1F4E79]/60 dark:bg-white/10 dark:text-gray-400">
                {columnApps.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: "calc(60vh - 3rem)" }}>
              {columnApps.length === 0 && (
                <p className="py-4 text-center text-[10px] text-[#1F4E79]/30 dark:text-gray-600">
                  {isOver ? "Soltar aquí" : "Sin candidatos"}
                </p>
              )}
              {columnApps.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, app.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => onCardClick(app.id)}
                  className={`group cursor-grab rounded-lg border bg-white p-2.5 shadow-sm transition-all active:cursor-grabbing dark:bg-[#0d1520] ${
                    dragging === app.id
                      ? "border-[#2EC4B6] opacity-50"
                      : updating === app.id
                        ? "border-[#2EC4B6] opacity-70"
                        : "border-gray-100 hover:border-gray-300 hover:shadow-md dark:border-white/10 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0B1F3B] dark:text-white">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#1F4E79]/50 dark:text-gray-500">
                        {app.jobTitle}
                      </p>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="mt-2 flex items-center gap-2">
                    {app.appliedAt && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#1F4E79]/40 dark:text-gray-600">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(app.appliedAt as string)}
                      </span>
                    )}
                    {app.cvPath && (
                      <span title="CV adjunto"><FileText className="h-3 w-3 text-[#1F4E79]/30 dark:text-gray-600" /></span>
                    )}
                    {app.cvAnalysis?.job_match && (
                      <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        app.cvAnalysis.job_match.score >= 75
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : app.cvAnalysis.job_match.score >= 50
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      }`}>
                        {app.cvAnalysis.job_match.score}%
                      </span>
                    )}
                    {!app.cvAnalysis?.job_match && app.cvAnalysis?.seniority_level && (
                      <span className="ml-auto text-[9px] font-medium text-[#1F4E79]/40 dark:text-gray-500">
                        {app.cvAnalysis.seniority_level}
                      </span>
                    )}
                  </div>

                  {updating === app.id && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2EC4B6]">
                      <Sparkles className="h-2.5 w-2.5 animate-spin" /> Actualizando...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
