"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/services/adminApi";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Shield,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const adminTabs = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/jobs", icon: Briefcase, label: "Búsquedas" },
  { href: "/admin/applications", icon: FileText, label: "Postulaciones" },
  { href: "/admin/users", icon: Users, label: "Usuarios" },
  { href: "/admin/allowlist", icon: Shield, label: "Accesos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;

    function fetchCount() {
      adminFetch("adminDashboard")
        .then((data: { pendingApplications?: number }) => {
          if (!cancelled) setPendingCount(data.pendingApplications || 0);
        })
        .catch(() => {});
    }

    const timer = setTimeout(fetchCount, 800);
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => { cancelled = true; clearTimeout(timer); clearInterval(interval); };
  }, [user, loading]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" />
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
          <p className="text-lg text-[#0B1F3B] dark:text-white">Necesitás iniciar sesión para acceder al panel admin</p>
          <Link href="/auth/signin?returnUrl=/admin" className="rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white hover:bg-[#26a89c]">
            Iniciar sesión
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[60vh] bg-gray-50 pt-20 dark:bg-[#0a0f1a]">
        {/* Admin tabs */}
        <div className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#0d1520]">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {adminTabs.map((tab) => {
                const active = pathname === tab.href || (tab.href !== "/admin" && pathname.startsWith(tab.href));
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#2EC4B6]/10 text-[#2EC4B6]"
                        : "text-[#1F4E79]/60 hover:bg-gray-100 hover:text-[#1F4E79] dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {tab.href === "/admin/applications" && pendingCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
