"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { adminFetch } from "@/services/adminApi";
import type { Job } from "@/types";

export default function EditJobClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminFetch("listJobs")
      .then((jobs: Job[]) => {
        if (cancelled) return;
        const found = jobs.find((j) => j.slug === id || j.id === id);
        if (found) setJob(found);
        else setError("Búsqueda no encontrada");
      })
      .catch(() => { if (!cancelled) setError("Error cargando búsqueda"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await adminFetch("updateJob", {
        method: "POST",
        body: JSON.stringify({
          jobId: id,
          title: form.get("title"),
          company: form.get("company"),
          description: form.get("description"),
          requirements: form.get("requirements"),
          location: form.get("location"),
          linkedinUrl: form.get("linkedinUrl"),
          tags: (form.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [],
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/jobs"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white";

  if (loading) return <div className="flex items-center gap-2 text-sm text-[#1F4E79]/50"><Loader2 className="h-4 w-4 animate-spin" /> Cargando...</div>;
  if (!job) return <p className="text-sm text-red-500">{error || "No encontrada"}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Editar búsqueda</h1>

      {error && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>}
      {success && <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">Búsqueda actualizada. Redirigiendo...</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Título *</label>
          <input name="title" required defaultValue={job.title} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Empresa *</label>
          <input name="company" required defaultValue={job.company} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Descripción *</label>
          <textarea name="description" required rows={4} defaultValue={job.description} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Requisitos</label>
          <textarea name="requirements" rows={3} defaultValue={job.requirements} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Ubicación</label>
          <input name="location" defaultValue={job.location} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Link LinkedIn</label>
          <input name="linkedinUrl" type="url" defaultValue={job.linkedinUrl || ""} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Tags</label>
          <input name="tags" defaultValue={job.tags?.join(", ")} className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white hover:bg-[#26a89c] disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
