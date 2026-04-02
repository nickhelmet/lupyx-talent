"use client";

import { motion } from "framer-motion";

const clients = [
  { name: "Startups IT", desc: "Empresas de tecnología en crecimiento" },
  { name: "Scale-ups LATAM", desc: "Compañías en expansión regional" },
  { name: "Software Houses", desc: "Fábricas de desarrollo de software" },
  { name: "Agencias Digitales", desc: "Marketing y diseño digital" },
];

export default function TrustedBy() {
  return (
    <section className="bg-[#f8fafb] py-16 dark:bg-[#0d1520]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-semibold tracking-wider text-[#2EC4B6] uppercase">Confían en nosotros</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {clients.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl border border-gray-100 bg-white p-5 text-center dark:border-white/10 dark:bg-white/5"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B1F3B]/5 text-lg font-bold text-[#0B1F3B] dark:bg-white/10 dark:text-white">
                  {c.name[0]}
                </div>
                <p className="mt-3 text-sm font-semibold text-[#0B1F3B] dark:text-white">{c.name}</p>
                <p className="mt-1 text-xs text-[#1F4E79]/50 dark:text-gray-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
