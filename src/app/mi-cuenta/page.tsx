"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LogOut, User, FileText } from "lucide-react";

export default function MiCuenta() {
  const { user, loading, logout, loginWithGoogle } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B] px-4">
        <img src="/logo.jpg" alt="Lupyx Talent" className="h-16 rounded-xl bg-white/10 p-1.5" />
        <p className="text-lg text-white">Iniciá sesión para ver tu cuenta</p>
        <button
          onClick={loginWithGoogle}
          className="rounded-full bg-white px-8 py-3 font-semibold text-[#0B1F3B] hover:bg-gray-100"
        >
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a]">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <button
          onClick={() => router.push("/")}
          className="mb-8 text-sm text-[#1F4E79]/60 hover:text-[#2EC4B6] dark:text-gray-400"
        >
          ← Volver al inicio
        </button>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <img
              src={user.photoURL || ""}
              alt=""
              className="h-16 w-16 rounded-full"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl font-bold text-[#0B1F3B] dark:text-white">
                {user.displayName}
              </h1>
              <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <a
              href="#"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:border-[#2EC4B6]/30 dark:border-white/10"
            >
              <User className="h-5 w-5 text-[#4FA3D1]" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white">Mi perfil</p>
                <p className="text-xs text-[#1F4E79]/50 dark:text-gray-500">Completar datos personales</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:border-[#2EC4B6]/30 dark:border-white/10"
            >
              <FileText className="h-5 w-5 text-[#2EC4B6]" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white">Mis postulaciones</p>
                <p className="text-xs text-[#1F4E79]/50 dark:text-gray-500">Ver estado de tus aplicaciones</p>
              </div>
            </a>
          </div>

          <button
            onClick={logout}
            className="mt-8 flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
