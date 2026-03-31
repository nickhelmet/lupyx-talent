"use client";

import { Search } from "lucide-react";

export default function AdminUsers() {
  return (
    <div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Buscar usuarios..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 text-center dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-[#1F4E79]/50 dark:text-gray-500">
          Los usuarios aparecerán acá cuando se registren via Google Sign-In.
        </p>
      </div>
    </div>
  );
}
