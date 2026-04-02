"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, page, perPage, onPageChange }: Props) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-xs text-[#1F4E79]/50 dark:text-gray-500">
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-[#1F4E79] disabled:cursor-default disabled:opacity-30 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-[#0B1F3B] dark:text-white">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-[#1F4E79] disabled:cursor-default disabled:opacity-30 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
