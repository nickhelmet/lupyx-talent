"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBase } from "@/lib/environment";

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = {
    title: searchParams.get("title") || "",
    company: searchParams.get("company") || "",
    description: searchParams.get("description") || "",
    requirements: searchParams.get("requirements") || "",
    location: searchParams.get("location") || "",
    tags: searchParams.get("tags") || "",
    linkedinUrl: searchParams.get("linkedinUrl") || "",
  };
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const res = await fetch(`${getApiBase()}/createJob`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.get("title"),
          company: form.get("company"),
          description: form.get("description"),
          requirements: form.get("requirements"),
          location: form.get("location"),
          type: form.get("type"),
          linkedinUrl: form.get("linkedinUrl"),
          tags: (form.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error creating job");
      }

      router.push("/admin/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Nueva búsqueda</h1>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Título del puesto *</label>
          <input name="title" required defaultValue={prefill.title} placeholder="Senior Backend Engineer" className={inputClass} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Empresa *</label>
          <input name="company" required defaultValue={prefill.company} placeholder="Nombre de la empresa o 'Confidencial'" className={inputClass} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Descripción *</label>
          <textarea name="description" required rows={4} defaultValue={prefill.description} placeholder="Descripción del puesto..." className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Requisitos</label>
          <textarea name="requirements" rows={3} defaultValue={prefill.requirements} placeholder="Requisitos del puesto..." className={`${inputClass} resize-none`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Ubicación</label>
            <input name="location" defaultValue={prefill.location} placeholder="Remoto LATAM / Buenos Aires" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Tipo</label>
            <select name="type" className={inputClass}>
              <option value="CONTRACT">Contractor</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Pasantía</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Link de LinkedIn</label>
          <input name="linkedinUrl" type="url" defaultValue={prefill.linkedinUrl} placeholder="https://linkedin.com/jobs/..." className={inputClass} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Tags (separados por coma)</label>
          <input name="tags" defaultValue={prefill.tags} placeholder="Java, Backend, +4 años exp." className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2EC4B6] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#26a89c] disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {submitting ? "Creando..." : "Crear búsqueda"}
        </button>
      </form>
    </div>
  );
}
