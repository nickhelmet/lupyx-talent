"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", destructive, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0d1520]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${destructive ? "bg-red-50 dark:bg-red-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
            <AlertTriangle className={`h-5 w-5 ${destructive ? "text-red-500" : "text-amber-500"}`} />
          </div>
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-[#1F4E79]/70 dark:text-gray-400">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-[#1F4E79] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              destructive ? "bg-red-500 hover:bg-red-600" : "bg-[#2EC4B6] hover:bg-[#26a89c]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
