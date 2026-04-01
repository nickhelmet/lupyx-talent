"use client";

import { useEffect, useState } from "react";
import { Search, Shield, ShieldOff, Loader2 } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBase } from "@/lib/environment";

interface UserItem {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

async function adminFetch(endpoint: string, options?: RequestInit) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await fetch(`${getApiBase()}/${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function loadUsers() {
    try {
      setError(null);
      const data = await adminFetch("listUsers");
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadUsers, 500);
    return () => clearTimeout(timer);
  }, []);

  async function toggleRole(uid: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await adminFetch("updateUserRole", {
        method: "POST",
        body: JSON.stringify({ uid, role: newRole }),
      });
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error updating role");
    }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#1F4E79]/50 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando usuarios...
      </div>
    );
  }

  return (
    <div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuarios..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#1F4E79]/50 dark:text-gray-500 py-8">
            {users.length === 0 ? "No hay usuarios registrados." : "Sin resultados."}
          </p>
        )}
        {filtered.map((u) => (
          <div
            key={u.uid}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <p className="font-semibold text-[#0B1F3B] dark:text-white">
                {u.firstName || ""} {u.lastName || ""} {!u.firstName && !u.lastName && u.email}
              </p>
              <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                u.role === "ADMIN"
                  ? "bg-[#0B1F3B]/10 text-[#0B1F3B] dark:bg-white/10 dark:text-white"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {u.role || "USER"}
              </span>
              <button
                onClick={() => toggleRole(u.uid, u.role || "USER")}
                className="text-[#1F4E79]/40 hover:text-[#2EC4B6] dark:text-gray-500"
                aria-label={u.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
              >
                {u.role === "ADMIN" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
