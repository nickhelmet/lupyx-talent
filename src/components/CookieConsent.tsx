"use client";

import { useSyncExternalStore, useCallback } from "react";

const CONSENT_KEY = "lupyx_cookie_consent";

const subscribe = () => () => {};

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(CONSENT_KEY);
}

export default function CookieConsent() {
  const show = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event("storage"));
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#0d1520]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-[#1F4E79]/80 dark:text-gray-300">
          Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.
          Al continuar navegando, aceptás su uso.
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
