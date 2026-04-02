"use client";

import { useEffect, useState } from "react";
import { Search, Shield, ShieldOff, Loader2, Download, UserX, UserCheck } from "lucide-react";
import { adminFetch } from "@/services/adminApi";

interface UserItem {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");

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
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function toggleStatus(uid: string, isActive: boolean) {
    try {
      await adminFetch("toggleUserStatus", {
        method: "POST",
        body: JSON.stringify({ uid, isActive: !isActive }),
      });
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  function exportCsv() {
    const headers = "Nombre,Apellido,Email,Rol,Activo,Registrado\n";
    const rows = filtered.map((u) =>
      `"${u.firstName || ""}","${u.lastName || ""}","${u.email || ""}","${u.role || "USER"}","${u.isActive !== false ? "Sí" : "No"}","${u.createdAt || ""}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios-lupyx-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuarios..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Usuario</option>
        </select>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-[#1F4E79] hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
        <span className="text-xs text-[#1F4E79]/50 dark:text-gray-500">{filtered.length} usuarios</span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#1F4E79]/50 dark:text-gray-500">
            {users.length === 0 ? "No hay usuarios registrados." : "Sin resultados."}
          </p>
        )}
        {filtered.map((u) => (
          <div
            key={u.uid}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#0B1F3B] dark:text-white">
                  {u.firstName || ""} {u.lastName || ""} {!u.firstName && !u.lastName && (u.email?.split("@")[0] || "—")}
                </p>
                {u.isActive === false && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">BLOQUEADO</span>
                )}
              </div>
              <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                u.role === "ADMIN"
                  ? "bg-[#0B1F3B]/10 text-[#0B1F3B] dark:bg-white/10 dark:text-white"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {u.role || "USER"}
              </span>
              <button
                onClick={() => toggleRole(u.uid, u.role || "USER")}
                className="cursor-pointer text-[#1F4E79]/40 hover:text-[#2EC4B6] dark:text-gray-500"
                title={u.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
              >
                {u.role === "ADMIN" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </button>
              <button
                onClick={() => toggleStatus(u.uid, u.isActive !== false)}
                className="cursor-pointer text-[#1F4E79]/40 hover:text-amber-500 dark:text-gray-500"
                title={u.isActive !== false ? "Bloquear" : "Activar"}
              >
                {u.isActive !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
