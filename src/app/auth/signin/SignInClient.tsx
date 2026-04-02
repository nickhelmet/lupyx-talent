"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Shield, Zap, Eye } from "lucide-react";
import Link from "next/link";

const benefits = [
  { icon: Zap, text: "Postulate en menos de 2 minutos" },
  { icon: Eye, text: "Seguí el estado de tus postulaciones en tiempo real" },
  { icon: Shield, text: "Tus datos están protegidos y son confidenciales" },
];

function SignInContent() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    if (user && !loading) {
      router.push(returnUrl);
    }
  }, [user, loading, router, returnUrl]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        {/* Left — Benefits */}
        <div className="hidden lg:flex lg:flex-col lg:justify-center">
          <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
            Encontrá tu próxima oportunidad
          </h1>
          <p className="mt-3 text-[#1F4E79]/70 dark:text-gray-400">
            Iniciá sesión para acceder a las mejores búsquedas IT y generales en LATAM.
          </p>
          <div className="mt-8 space-y-4">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2EC4B6]/10">
                  <b.icon className="h-4 w-4 text-[#2EC4B6]" />
                </div>
                <p className="text-sm text-[#1F4E79]/80 dark:text-gray-300">{b.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-[#1F4E79]/40 dark:text-gray-600">
            &ldquo;Lupyx entendió exactamente lo que buscábamos. En dos semanas teníamos al candidato.&rdquo;
            <span className="mt-1 block font-medium text-[#1F4E79]/60 dark:text-gray-500">— CTO, Startup tecnológica</span>
          </p>
        </div>

        {/* Right — Login */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <img
            src="/logo.jpg"
            alt="Lupyx Talent"
            className="mx-auto h-16 w-auto"
          />

          <h2 className="mt-6 text-center text-2xl font-bold text-[#0B1F3B] dark:text-white">Iniciar sesión</h2>
          <p className="mt-2 text-center text-sm text-[#1F4E79]/60 dark:text-gray-400">
            Usá tu cuenta de Google para continuar
          </p>

          <button
            onClick={loginWithGoogle}
            className="mt-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#0B1F3B] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#1F4E79] hover:shadow-xl dark:bg-[#2EC4B6] dark:hover:bg-[#26a89c]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          <p className="mt-6 text-center text-xs text-[#1F4E79]/40 dark:text-gray-600">
            Al continuar, aceptás nuestros{" "}
            <Link href="/terminos" className="text-[#2EC4B6] hover:underline">Términos</Link>
            {" "}y{" "}
            <Link href="/privacidad" className="text-[#2EC4B6] hover:underline">Política de Privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2EC4B6] border-t-transparent" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
