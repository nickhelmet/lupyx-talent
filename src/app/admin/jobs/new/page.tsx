"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBase } from "@/lib/environment";

interface ScreeningQuestion {
  text: string;
  type: "text" | "yesno" | "select" | "number";
  required: boolean;
  options: string[];
}

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
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);

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
          screeningQuestions: questions.filter((q) => q.text.trim()),
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

        {/* Screening Questions */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Preguntas de screening</label>
            {questions.length < 10 && (
              <button
                type="button"
                onClick={() => setQuestions([...questions, { text: "", type: "text", required: false, options: [] }])}
                className="flex items-center gap-1 text-xs font-semibold text-[#2EC4B6] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar pregunta
              </button>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#1F4E79]/50 dark:text-gray-500">
            Los candidatos responderán estas preguntas al postularse. Máximo 10.
          </p>

          {questions.length > 0 && (
            <div className="mt-3 space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                    <div className="flex-1 space-y-2">
                      <input
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[i].text = e.target.value;
                          setQuestions(updated);
                        }}
                        placeholder="Ej: ¿Cuántos años de experiencia tenés en Java?"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[i].type = e.target.value as ScreeningQuestion["type"];
                            if (e.target.value !== "select") updated[i].options = [];
                            setQuestions(updated);
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                          <option value="text">Texto libre</option>
                          <option value="yesno">Sí / No</option>
                          <option value="number">Numérico</option>
                          <option value="select">Opciones</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-[#1F4E79]/60 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i].required = e.target.checked;
                              setQuestions(updated);
                            }}
                            className="rounded"
                          />
                          Obligatoria
                        </label>
                      </div>
                      {q.type === "select" && (
                        <input
                          value={q.options.join(", ")}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[i].options = e.target.value.split(",").map((o) => o.trim());
                            setQuestions(updated);
                          }}
                          placeholder="Opciones separadas por coma: Básico, Intermedio, Avanzado"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                      className="mt-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
