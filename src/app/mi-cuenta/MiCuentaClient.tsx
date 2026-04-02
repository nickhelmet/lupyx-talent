"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ApplicationProgress from "@/components/ApplicationProgress";
import { LogOut, FileText, Loader2 } from "lucide-react";
import { fetchMyApplications } from "@/services/api";
import type { Application } from "@/types";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWING: "En revisión",
  INTERVIEW: "Entrevista",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  HIRED: "Contratado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  REVIEWING: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  INTERVIEW: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  ACCEPTED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  REJECTED: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  HIRED: "bg-[#2EC4B6]/10 text-[#2EC4B6]",
};

export default function MiCuenta() {
  const { user, loading, logout, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  const [appsError, setAppsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;
    fetchMyApplications()
      .then((data) => { if (!cancelled) setApps(data); })
      .catch((e) => { if (!cancelled) setAppsError(e instanceof Error ? e.message : "Error cargando postulaciones"); })
      .finally(() => { if (!cancelled) setAppsLoading(false); });
    return () => { cancelled = true; };
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B] px-4">
        <img src="/logo.jpg" alt="Lupyx Talent" className="h-16 rounded-xl bg-white/10 p-1.5" />
        <p className="text-lg text-white">Iniciá sesión para ver tu cuenta</p>
        <button
          onClick={loginWithGoogle}
          className="rounded-full bg-white px-8 py-3 font-semibold text-[#0B1F3B] hover:bg-gray-100"
        >
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a]">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <button
          onClick={() => router.push("/")}
          className="mb-8 text-sm text-[#1F4E79]/60 hover:text-[#2EC4B6] dark:text-gray-400"
        >
          ← Volver al inicio
        </button>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <img
              src={user.photoURL || ""}
              alt="Foto de perfil"
              className="h-16 w-16 rounded-full"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl font-bold text-[#0B1F3B] dark:text-white">{user.displayName}</h1>
              <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <h2 className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
            <FileText className="h-4 w-4 text-[#2EC4B6]" /> Mis postulaciones
          </h2>

          {appsError && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {appsError}
            </div>
          )}
          {appsLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#1F4E79]/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
            </div>
          ) : apps.length === 0 && !appsError ? (
            <p className="mt-4 text-sm text-[#1F4E79]/50 dark:text-gray-500">
              No te has postulado a ninguna búsqueda todavía.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {apps.map((app) => (
                <div key={app.id} className="rounded-xl border border-gray-100 p-4 dark:border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{app.jobTitle}</p>
                      <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{app.jobCompany}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[app.status] || "bg-gray-100 text-gray-500"}`}>
                      {statusLabels[app.status] || app.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <ApplicationProgress status={app.status} />
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-[#1F4E79]/50 dark:text-gray-500">
                    {app.appliedAt && (
                      <span>Postulado: {(() => {
                        const d = typeof app.appliedAt === "object" && "_seconds" in (app.appliedAt as Record<string, unknown>)
                          ? new Date((app.appliedAt as unknown as { _seconds: number })._seconds * 1000)
                          : new Date(app.appliedAt as string);
                        return `${d.toLocaleDateString("es-AR")} ${d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
                      })()}</span>
                    )}
                  </div>
                  {app.interviewMeta?.notes && (
                    <div className="mt-3 rounded-lg bg-[#2EC4B6]/5 p-3">
                      <p className="text-xs font-semibold text-[#2EC4B6]">Comentario del reclutador</p>
                      <p className="mt-1 text-sm text-[#1F4E79]/80 dark:text-gray-300">{app.interviewMeta.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={logout}
            className="mt-8 flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
