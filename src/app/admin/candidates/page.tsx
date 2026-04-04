"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X, Loader2, Trash2, Tag } from "lucide-react";
import { adminFetch } from "@/services/adminApi";
import Pagination from "@/components/Pagination";
import { SkeletonList } from "@/components/Skeleton";
import type { Candidate } from "@/types";

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  linkedin: "LinkedIn",
  referral: "Referido",
  import: "Importación",
  website: "Sitio web",
};

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;

  async function loadCandidates() {
    try {
      setError(null);
      const data = await adminFetch("listCandidates");
      setCandidates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading candidates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadCandidates, 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await adminFetch("addCandidate", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          phone: form.get("phone"),
          city: form.get("city"),
          skills: (form.get("skills") as string)?.split(",").map((s) => s.trim()).filter(Boolean) || [],
          notes: form.get("notes"),
          tags: (form.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [],
          source: form.get("source") || "manual",
        }),
      });
      setShowForm(false);
      await loadCandidates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error adding candidate");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar candidato "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await adminFetch("deleteCandidate", {
        method: "POST",
        body: JSON.stringify({ candidateId: id }),
      });
      await loadCandidates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error deleting candidate");
    } finally {
      setDeleting(null);
    }
  }

  const allTags = [...new Set(candidates.flatMap((c) => c.tags || []))].sort();

  const filtered = candidates.filter((c) => {
    if (filterTag && !(c.tags || []).includes(filterTag)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      (c.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <SkeletonList count={5} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#0B1F3B] dark:text-white">Candidatos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-[#2EC4B6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#26a89c]"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Agregar candidato"}
        </button>
      </div>

      {/* Add candidate form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 rounded-xl border border-[#2EC4B6]/20 bg-[#2EC4B6]/5 p-5 dark:bg-[#2EC4B6]/5">
          <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Nuevo candidato</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input name="firstName" required placeholder="Nombre *" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="lastName" required placeholder="Apellido *" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="email" type="email" placeholder="Email" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="phone" placeholder="Teléfono" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="city" placeholder="Ciudad" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <select name="source" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="manual">Manual</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referido</option>
              <option value="import">Importación</option>
              <option value="website">Sitio web</option>
            </select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input name="skills" placeholder="Skills (separados por coma)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input name="tags" placeholder="Tags (separados por coma)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <textarea name="notes" rows={3} placeholder="Notas..." className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white" />
          <div className="mt-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#2EC4B6] px-6 py-2 text-sm font-semibold text-white hover:bg-[#26a89c] disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar candidato
            </button>
          </div>
        </form>
      )}

      {/* Search and filters */}
      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre, email, ciudad, skills..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <span className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{filtered.length} candidatos</span>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => { setFilterTag(""); setPage(1); }}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filterTag ? "bg-[#2EC4B6] text-white" : "bg-gray-100 text-[#1F4E79]/60 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400"}`}
          >
            Todos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setFilterTag(filterTag === tag ? "" : tag); setPage(1); }}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterTag === tag ? "bg-[#2EC4B6] text-white" : "bg-gray-100 text-[#1F4E79]/60 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400"}`}
            >
              <Tag className="mr-1 inline h-3 w-3" />{tag}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}

      {/* Candidates list */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#1F4E79]/50 dark:text-gray-500">
            {candidates.length === 0 ? "No hay candidatos en la base de datos." : "Sin resultados para tu búsqueda."}
          </p>
        )}
        {paginated.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                    {c.firstName} {c.lastName}
                  </h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-[#1F4E79]/60 dark:bg-white/10 dark:text-gray-400">
                    {sourceLabels[c.source] || c.source}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-[#1F4E79]/60 dark:text-gray-400">
                  {c.email && (
                    <span
                      onClick={() => navigator.clipboard.writeText(c.email!)}
                      className="cursor-pointer hover:text-[#2EC4B6]"
                      title="Click para copiar email"
                    >{c.email}</span>
                  )}
                  {c.email && c.phone && " · "}
                  {c.phone}
                  {c.city && <span className="text-[#1F4E79]/40 dark:text-gray-600"> · {c.city}</span>}
                </p>

                {/* Skills */}
                {c.skills && c.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.skills.map((s, i) => (
                      <span key={i} className="rounded-full bg-[#4FA3D1]/10 px-2 py-0.5 text-[11px] font-medium text-[#1F4E79] dark:bg-[#4FA3D1]/20 dark:text-[#4FA3D1]">{s}</span>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {c.tags && c.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.tags.map((t, i) => (
                      <span key={i} className="rounded-full bg-[#2EC4B6]/10 px-2 py-0.5 text-[10px] font-medium text-[#2EC4B6]">
                        <Tag className="mr-0.5 inline h-2.5 w-2.5" />{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {c.notes && (
                  <p className="mt-2 text-xs text-[#1F4E79]/50 dark:text-gray-500 line-clamp-2">{c.notes}</p>
                )}
              </div>

              <button
                onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)}
                disabled={deleting === c.id}
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                title="Eliminar candidato"
              >
                {deleting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination total={filtered.length} page={page} perPage={perPage} onPageChange={setPage} />
    </div>
  );
}
