"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B]" />
      <motion.div
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#2EC4B6]/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            ¿Necesitás talento para tu equipo?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#4FA3D1]/80">
            Te ayudamos a encontrar al candidato ideal. Procesos ágiles, perfiles validados, compensación en USD.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:jm@lupyxtalent.com"
              className="rounded-full bg-[#2EC4B6] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2EC4B6]/25 transition-all hover:bg-[#26a89c] hover:shadow-xl"
            >
              Contactanos
            </a>
            <Link
              href="/nosotros"
              className="rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-white/5"
            >
              Conocé nuestro proceso
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
