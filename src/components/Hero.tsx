"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B]" />
        <motion.div
          className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-[#2EC4B6]/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-[#4FA3D1]/15 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.jpg"
                alt="Lupyx Talent"
                className="mx-auto h-28 w-auto rounded-2xl bg-white/10 p-3 backdrop-blur-sm sm:h-40 lg:h-48"
              />
            </picture>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 inline-block rounded-full border border-[#2EC4B6]/30 bg-[#2EC4B6]/10 px-4 py-1.5 text-sm font-medium text-[#2EC4B6]"
          >
            Consultora de Reclutamiento y Selección
          </motion.div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Conectando{" "}
            <span className="bg-gradient-to-r from-[#2EC4B6] to-[#4FA3D1] bg-clip-text text-transparent">
              talento
            </span>
            <br />
            con oportunidades
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-[#4FA3D1]/90 sm:text-xl"
          >
            Acompañamos a empresas en la identificación, atracción y selección
            del talento adecuado. Procesos integrales para posiciones IT y
            generales en LATAM.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/busquedas"
              className="group rounded-full bg-[#2EC4B6] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#2EC4B6]/25 transition-all hover:bg-[#26a89c] hover:shadow-xl hover:shadow-[#2EC4B6]/30"
            >
              Ver búsquedas activas
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <a
              href="#nosotros"
              className="rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              Conocenos
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="h-5 w-5 text-white/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
