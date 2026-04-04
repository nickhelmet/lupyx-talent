"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Loader2, Save, CheckCircle, Circle, User } from "lucide-react";
import { fetchMyApplications, fetchProfile, updateProfile } from "@/services/api";
import ApplicationProgress from "@/components/ApplicationProgress";
import type { Application } from "@/types";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente", REVIEWING: "En revisión", INTERVIEW: "Entrevista",
  ACCEPTED: "Aceptada", REJECTED: "Rechazada", HIRED: "Contratado",
};
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  REVIEWING: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  INTERVIEW: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  ACCEPTED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  REJECTED: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  HIRED: "bg-[#2EC4B6]/10 text-[#2EC4B6]",
};
const educationOptions = [
  { value: "", label: "Seleccionar..." },
  { value: "PRIMARY", label: "Primario" }, { value: "SECONDARY", label: "Secundario" },
  { value: "TERTIARY", label: "Terciario" }, { value: "UNIVERSITY", label: "Universitario" },
  { value: "POSTGRADUATE", label: "Posgrado" }, { value: "MASTER", label: "Maestría" },
  { value: "PHD", label: "Doctorado" },
];

interface ProfileData {
  phone?: string; city?: string; dni?: string; birthDate?: string; educationLevel?: string;
}

export default function MiCuentaClient() {
  const { user, loading, loginWithGoogle } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "applications">("profile");

  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;

    fetchProfile()
      .then((data) => { if (!cancelled) setProfile(data || {}); })
      .catch((err) => { console.warn("fetchProfile error:", err); })
      .finally(() => { if (!cancelled) setProfileLoading(false); });

    fetchMyApplications()
      .then((data) => { if (!cancelled) setApps(data); })
      .catch((e) => { if (!cancelled) setAppsError(e instanceof Error ? e.message : "Error"); })
      .finally(() => { if (!cancelled) setAppsLoading(false); });

    return () => { cancelled = true; };
  }, [user, loading]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const updated = {
        phone: form.get("phone") as string,
        city: form.get("city") as string,
        dni: form.get("dni") as string,
        birthDate: form.get("birthDate") as string,
        educationLevel: form.get("educationLevel") as string,
      };
      await updateProfile(updated);
      setProfile((prev) => ({ ...prev, ...updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  // Onboarding progress (only computed after profile loads)
  const profileComplete = !profileLoading && !!(profile.phone && profile.city);
  const steps = [
    { label: "Crear cuenta", done: true },
    { label: "Completar perfil", done: profileComplete },
    { label: "Explorar búsquedas", done: true },
    { label: "Postularse", done: !appsLoading && apps.length > 0 },
  ];
  const completedSteps = steps.filter((s) => s.done).length;

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-[#0a0f1a]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-4 dark:bg-[#0a0f1a]">
        <img src="/logo.jpg" alt="Lupyx Talent" className="h-16" />
        <p className="text-lg text-[#0B1F3B] dark:text-white">Iniciá sesión para ver tu cuenta</p>
        <button onClick={loginWithGoogle} className="cursor-pointer rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white hover:bg-[#26a89c]">Iniciar sesión con Google</button>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <div className="min-h-[60vh] bg-white pt-24 dark:bg-[#0a0f1a]">
      <div className="mx-auto max-w-3xl px-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4">
          <img src={user.photoURL || ""} alt="" className="h-16 w-16 rounded-full" referrerPolicy="no-referrer" />
          <div>
            <h1 className="text-xl font-bold text-[#0B1F3B] dark:text-white">{user.displayName}</h1>
            <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Onboarding */}
        {completedSteps < steps.length && (
          <div className="mt-6 rounded-2xl border border-[#2EC4B6]/20 bg-[#2EC4B6]/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Tu progreso</p>
              <span className="text-xs font-bold text-[#2EC4B6]">{completedSteps}/{steps.length}</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white dark:bg-white/10">
              <div className="h-full rounded-full bg-[#2EC4B6] transition-all" style={{ width: `${(completedSteps / steps.length) * 100}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {steps.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  {s.done ? <CheckCircle className="h-3.5 w-3.5 text-[#2EC4B6]" /> : <Circle className="h-3.5 w-3.5 text-[#1F4E79]/30 dark:text-gray-600" />}
                  <span className={`text-xs ${s.done ? "text-[#2EC4B6] font-medium" : "text-[#1F4E79]/50 dark:text-gray-500"}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-gray-200 dark:border-white/10">
          <button onClick={() => setTab("profile")} className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${tab === "profile" ? "border-b-2 border-[#2EC4B6] text-[#2EC4B6]" : "text-[#1F4E79]/60 dark:text-gray-400"}`}>
            <User className="mr-1.5 inline h-4 w-4" />Mi perfil
          </button>
          <button onClick={() => setTab("applications")} className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${tab === "applications" ? "border-b-2 border-[#2EC4B6] text-[#2EC4B6]" : "text-[#1F4E79]/60 dark:text-gray-400"}`}>
            <FileText className="mr-1.5 inline h-4 w-4" />Postulaciones ({apps.length})
          </button>
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="mt-6">
            {profileLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#1F4E79]/50"><Loader2 className="h-4 w-4 animate-spin" /> Cargando perfil...</div>
            ) : (
              <form onSubmit={saveProfile} key={JSON.stringify(profile)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Teléfono</label>
                    <input name="phone" type="tel" defaultValue={profile.phone || ""} placeholder="+54 11 1234-5678" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Ciudad</label>
                    <input name="city" defaultValue={profile.city || ""} placeholder="Buenos Aires" className={inputClass} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">DNI</label>
                    <input name="dni" defaultValue={profile.dni || ""} placeholder="12345678" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Fecha de nacimiento</label>
                    <input name="birthDate" type="date" defaultValue={profile.birthDate || ""} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Nivel educativo</label>
                  <select name="educationLevel" defaultValue={profile.educationLevel || ""} className={inputClass}>
                    {educationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-full bg-[#2EC4B6] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#26a89c] disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saving ? "Guardando..." : saved ? "Guardado" : "Guardar perfil"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Applications tab */}
        {tab === "applications" && (
          <div className="mt-6">
            {appsError && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{appsError}</div>
            )}
            {appsLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#1F4E79]/50"><Loader2 className="h-4 w-4 animate-spin" /> Cargando...</div>
            ) : apps.length === 0 && !appsError ? (
              <p className="text-sm text-[#1F4E79]/50 dark:text-gray-500">No te has postulado a ninguna búsqueda todavía.</p>
            ) : (
              <div className="space-y-4">
                {apps.map((app) => (
                  <div key={app.id} className="rounded-xl border border-gray-100 p-4 dark:border-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <a href={`/busquedas/${app.jobId}/`} className="font-medium text-[#0B1F3B] hover:text-[#2EC4B6] dark:text-white">{app.jobTitle}</a>
                        <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{app.jobCompany}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[app.status] || "bg-gray-100 text-gray-500"}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </div>
                    <div className="mt-4"><ApplicationProgress status={app.status} /></div>
                    <div className="mt-3 text-xs text-[#1F4E79]/50 dark:text-gray-500">
                      {app.appliedAt && (() => {
                        const d = typeof app.appliedAt === "object" && "_seconds" in (app.appliedAt as Record<string, unknown>)
                          ? new Date((app.appliedAt as unknown as { _seconds: number })._seconds * 1000)
                          : new Date(app.appliedAt as string);
                        return `Postulado: ${d.toLocaleDateString("es-AR")} ${d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
                      })()}
                    </div>
                    {/* Public comments from recruiter */}
                    {((app as unknown as Record<string, unknown>).comments as Array<{ text: string; author: string; createdAt: string }> | undefined)?.map((c, ci) => (
                      <div key={ci} className="mt-3 rounded-lg bg-[#2EC4B6]/5 p-3">
                        <div className="flex items-center gap-2 text-xs text-[#2EC4B6]">
                          <span className="font-semibold">Comentario del reclutador</span>
                          <span className="text-[#1F4E79]/40">· {new Date(c.createdAt).toLocaleDateString("es-AR")}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#1F4E79]/80 dark:text-gray-300">{c.text}</p>
                      </div>
                    ))}
                    {app.interviewMeta?.notes && !((app as unknown as Record<string, unknown>).comments as unknown[])?.length && (
                      <div className="mt-3 rounded-lg bg-[#2EC4B6]/5 p-3">
                        <p className="text-xs font-semibold text-[#2EC4B6]">Comentario del reclutador</p>
                        <p className="mt-1 text-sm text-[#1F4E79]/80 dark:text-gray-300">{app.interviewMeta.notes}</p>
                      </div>
                    )}
                    {app.status === "PENDING" && (
                      <button
                        onClick={async () => {
                          if (!confirm("¿Estás seguro de retirar tu postulación? Podrás volver a postularte después.")) return;
                          try {
                            const { withdrawApplication } = await import("@/services/api");
                            await withdrawApplication(app.id);
                            setApps((prev) => prev.filter((a) => a.id !== app.id));
                          } catch {
                            setAppsError("Error al retirar postulación");
                          }
                        }}
                        className="mt-3 cursor-pointer text-xs text-red-500 hover:underline"
                      >
                        Retirar postulación
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
