"use client";

import { Search, Filter } from "lucide-react";

export default function AdminApplications() {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar por nombre, email, DNI..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2EC4B6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#1F4E79] dark:border-white/10 dark:text-gray-300">
          <Filter className="h-4 w-4" /> Filtros
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 text-center dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-[#1F4E79]/50 dark:text-gray-500">
          No hay postulaciones todavía. Aparecerán acá cuando los candidatos apliquen a las búsquedas.
        </p>
      </div>
    </div>
  );
}
