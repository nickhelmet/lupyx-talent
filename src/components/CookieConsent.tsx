"use client";

import { useSyncExternalStore } from "react";

const CONSENT_KEY = "lupyx_cookie_consent";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(CONSENT_KEY);
}

function notify() {
  listeners.forEach((l) => l());
}

export default function CookieConsent() {
  const show = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!show) return null;

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    notify();
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#0d1520]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-[#1F4E79]/80 dark:text-gray-300">
          Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.
          Al continuar navegando, aceptás su uso.{" "}
          <a href="/privacidad" className="text-[#2EC4B6] underline">Política de Privacidad</a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-full bg-[#2EC4B6] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#26a89c]"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
