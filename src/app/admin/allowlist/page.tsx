"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Shield, ShieldCheck, Loader2 } from "lucide-react";
import { adminFetch } from "@/services/adminApi";

interface AllowlistData {
  allowed_emails: string[];
  admin_emails: string[];
  blocked_emails: string[];
}

export default function AllowlistPage() {
  const [data, setData] = useState<AllowlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  async function loadData() {
    try {
      const result = await adminFetch("getAllowlist");
      setData(result);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadData, 500);
    return () => clearTimeout(timer);
  }, []);

  async function addEmail(list: string) {
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      await adminFetch("addAllowlistEmail", {
        method: "POST",
        body: JSON.stringify({ email: newEmail.trim().toLowerCase(), list }),
      });
      setNewEmail("");
      await loadData();
    } catch { /* ignore */ } finally {
      setAdding(false);
    }
  }

  async function removeEmail(email: string, list: string) {
    try {
      await adminFetch("removeAllowlistEmail", {
        method: "POST",
        body: JSON.stringify({ email, list }),
      });
      await loadData();
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#1F4E79]/50 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add email */}
      <div className="flex gap-3">
        <input
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email@ejemplo.com"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        <button
          onClick={() => addEmail("allowed_emails")}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-[#2EC4B6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#26a89c] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Agregar usuario
        </button>
        <button
          onClick={() => addEmail("admin_emails")}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-[#0B1F3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1F4E79] disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" /> Agregar admin
        </button>
      </div>

      {/* Allowed emails */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
          <Shield className="h-4 w-4 text-[#2EC4B6]" /> Usuarios autorizados ({data?.allowed_emails.length || 0})
        </h2>
        <div className="mt-3 space-y-2">
          {data?.allowed_emails.map((email) => (
            <div key={email} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0B1F3B] dark:text-white">{email}</span>
                {data.admin_emails.includes(email) && (
                  <span className="rounded-full bg-[#0B1F3B]/10 px-2 py-0.5 text-xs font-semibold text-[#0B1F3B] dark:bg-white/10 dark:text-white">Admin</span>
                )}
              </div>
              <button onClick={() => removeEmail(email, "allowed_emails")} className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin emails */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3B] dark:text-white">
          <ShieldCheck className="h-4 w-4 text-[#1F4E79]" /> Administradores ({data?.admin_emails.length || 0})
        </h2>
        <div className="mt-3 space-y-2">
          {data?.admin_emails.map((email) => (
            <div key={email} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <span className="text-sm text-[#0B1F3B] dark:text-white">{email}</span>
              <button onClick={() => removeEmail(email, "admin_emails")} className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
