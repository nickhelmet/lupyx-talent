"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { submitApplication } from "@/services/api";
import { ArrowLeft, Send, Loader2, Upload, FileText, X } from "lucide-react";

const educationOptions = [
  { value: "PRIMARY", label: "Primario" },
  { value: "SECONDARY", label: "Secundario" },
  { value: "TERTIARY", label: "Terciario" },
  { value: "UNIVERSITY", label: "Universitario" },
  { value: "POSTGRADUATE", label: "Posgrado" },
  { value: "MASTER", label: "Maestría" },
  { value: "PHD", label: "Doctorado" },
];

export default function PostularClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1F3B]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B] px-4">
        <img src="/logo.jpg" alt="Lupyx Talent" className="h-16 rounded-xl bg-white/10 p-1.5" />
        <p className="text-lg text-white">Necesitás iniciar sesión para postularte</p>
        <button
          onClick={loginWithGoogle}
          className="rounded-full bg-white px-8 py-3 font-semibold text-[#0B1F3B] transition-all hover:bg-gray-100"
        >
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B] px-4 text-center">
        <div className="rounded-full bg-[#2EC4B6]/20 p-4">
          <Send className="h-8 w-8 text-[#2EC4B6]" />
        </div>
        <h1 className="text-2xl font-bold text-white">¡Postulación enviada!</h1>
        <p className="max-w-md text-[#4FA3D1]/80">
          Recibimos tu postulación. Te contactaremos pronto con novedades.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white transition-all hover:bg-[#26a89c]"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    if (!cvFile) {
      setError("Debés adjuntar tu CV en formato PDF");
      setSubmitting(false);
      return;
    }

    let cvBase64 = "";
    try {
      const buffer = await cvFile.arrayBuffer();
      cvBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    } catch {
      setError("Error al procesar el archivo");
      setSubmitting(false);
      return;
    }

    try {
      await submitApplication({
        jobId: slug,
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone"),
        address: form.get("address"),
        city: form.get("city"),
        birthDate: form.get("birthDate"),
        educationLevel: form.get("educationLevel"),
        dni: form.get("dni"),
        coverLetter: form.get("coverLetter"),
        cvFileName: cvFile.name,
        cvBase64,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar postulación");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a]">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm text-[#1F4E79]/60 hover:text-[#2EC4B6] dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white">Postularme</h1>
        <p className="mt-2 text-[#1F4E79]/60 dark:text-gray-400">
          Completá tus datos. Tu email ({user.email}) se incluirá automáticamente.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Nombre *</label>
              <input name="firstName" required defaultValue={user.displayName?.split(" ")[0] || ""} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Apellido *</label>
              <input name="lastName" required defaultValue={user.displayName?.split(" ").slice(1).join(" ") || ""} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Teléfono *</label>
            <input name="phone" type="tel" required placeholder="+54 11 1234-5678" className={inputClass} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Ciudad</label>
              <input name="city" placeholder="Buenos Aires" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">DNI</label>
              <input name="dni" placeholder="12345678" className={inputClass} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Fecha de nacimiento</label>
              <input name="birthDate" type="date" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Nivel educativo</label>
              <select name="educationLevel" className={inputClass}>
                <option value="">Seleccionar...</option>
                {educationOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">Carta de presentación</label>
            <textarea name="coverLetter" rows={4} placeholder="Contanos por qué te interesa esta posición..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0B1F3B] dark:text-gray-200">CV (PDF, máx 5MB) *</label>
            {cvFile ? (
              <div className="flex items-center justify-between rounded-xl border border-[#2EC4B6]/30 bg-[#2EC4B6]/5 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-[#0B1F3B] dark:text-white">
                  <FileText className="h-4 w-4 text-[#2EC4B6]" />
                  <span className="truncate max-w-[200px]">{cvFile.name}</span>
                  <span className="text-xs text-[#1F4E79]/50">({(cvFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button type="button" onClick={() => setCvFile(null)} className="text-[#1F4E79]/40 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 transition-colors hover:border-[#2EC4B6] dark:border-white/10">
                <Upload className="h-6 w-6 text-[#4FA3D1]" />
                <span className="text-sm text-[#1F4E79]/60 dark:text-gray-400">Click para seleccionar PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      setError("El archivo no puede superar 5MB");
                      return;
                    }
                    if (file.type !== "application/pdf") {
                      setError("Solo se aceptan archivos PDF");
                      return;
                    }
                    setError(null);
                    setCvFile(file);
                  }}
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2EC4B6] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#26a89c] hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>) : (<><Send className="h-4 w-4" /> Enviar postulación</>)}
          </button>
        </form>
      </div>
    </div>
  );
}
