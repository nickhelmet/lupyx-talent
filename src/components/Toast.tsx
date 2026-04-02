"use client";

import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastCtx {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastCtx>({
  success: () => {},
  error: () => {},
});

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: "success" | "error") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const ctx: ToastCtx = {
    success: (msg) => add(msg, "success"),
    error: (msg) => add(msg, "error"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-300"
                : "border-red-200 bg-red-50/95 text-red-700 dark:border-red-800 dark:bg-red-900/90 dark:text-red-300"
            }`}
          >
            {t.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <p className="text-sm">{t.message}</p>
            <button onClick={() => remove(t.id)} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
