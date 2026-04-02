"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Shield,
  LogOut,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { adminFetch } from "@/services/adminApi";

const sidebarLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/jobs", icon: Briefcase, label: "Búsquedas" },
  { href: "/admin/applications", icon: FileText, label: "Postulaciones" },
  { href: "/admin/users", icon: Users, label: "Usuarios" },
  { href: "/admin/allowlist", icon: Shield, label: "Accesos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      adminFetch("adminDashboard")
        .then((data: { pendingApplications?: number }) => {
          if (!cancelled) setPendingCount(data.pendingApplications || 0);
        })
        .catch(() => {});
    }, 800);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [user, loading, pathname]);

  // Show spinner while auth resolves (loading=true means onAuthStateChanged hasn't fired yet)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1F3B]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B] px-4">
        <img src="/logo.webp" alt="Lupyx Talent" className="h-16 rounded-xl bg-white/10 p-1.5" />
        <p className="text-lg text-white">Necesitás iniciar sesión para acceder al panel admin</p>
        <Link href="/auth/signin?returnUrl=/admin" className="rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white hover:bg-[#26a89c]">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0f1a]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#0B1F3B] transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <img src="/logo.jpg" alt="Lupyx" className="h-8 rounded" />
          <span className="text-sm font-semibold text-white">Admin</span>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#2EC4B6]/10 text-[#2EC4B6]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="flex-1">{link.label}</span>
                {link.href === "/admin/applications" && pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <img
              src={user.photoURL || ""}
              alt=""
              className="h-8 w-8 rounded-full"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-white">
                {user.displayName}
              </p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-white/40 hover:text-red-400"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 dark:border-white/10 dark:bg-[#0d1520] lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#0B1F3B] dark:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
            {sidebarLinks.find((l) => l.href === pathname)?.label || "Admin"}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
