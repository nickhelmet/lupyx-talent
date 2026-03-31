"use client";

import { useSyncExternalStore, useCallback } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("lupyx-theme", next ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[#1F4E79] transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
