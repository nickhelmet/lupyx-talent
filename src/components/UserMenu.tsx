"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { User, Shield, LogOut } from "lucide-react";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  function navigate(path: string) {
    setOpen(false);
    router.push(path);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
        aria-label="Menú de usuario"
      >
        <img
          src={user.photoURL || ""}
          alt="Mi cuenta"
          className={`h-8 w-8 rounded-full transition-all ${open ? "ring-2 ring-[#2EC4B6]" : "hover:ring-2 hover:ring-[#2EC4B6]/50"}`}
          referrerPolicy="no-referrer"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-white/10 dark:bg-[#0d1520]">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{user.displayName}</p>
            <p className="text-xs text-[#1F4E79]/60 dark:text-gray-500">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => navigate("/mi-cuenta")}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[#1F4E79] transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <User className="h-4 w-4" /> Mi cuenta
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[#1F4E79] transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <Shield className="h-4 w-4" /> Panel admin
            </button>
          </div>

          <div className="border-t border-gray-100 py-1 dark:border-white/10">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
