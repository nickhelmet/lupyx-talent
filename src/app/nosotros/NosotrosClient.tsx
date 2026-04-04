"use client";

import { motion } from "framer-motion";
import { Target, Shield, Heart, Zap } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Heart, title: "Experiencia del candidato", desc: "Priorizamos un proceso humano, transparente y respetuoso para cada postulante." },
  { icon: Target, title: "Alineamiento con el negocio", desc: "Entendemos la cultura y objetivos de cada organización para encontrar el match perfecto." },
  { icon: Zap, title: "Agilidad", desc: "Procesos eficientes sin sacrificar calidad. Tiempos de respuesta competitivos." },
  { icon: Shield, title: "Confidencialidad", desc: "Manejo discreto de información sensible de empresas y candidatos." },
];

const process = [
  { step: "01", title: "Relevamiento", desc: "Entendemos el perfil, la cultura de la empresa y las expectativas del rol." },
  { step: "02", title: "Sourcing", desc: "Identificamos y contactamos candidatos a través de múltiples canales." },
  { step: "03", title: "Evaluación", desc: "Entrevistas técnicas y culturales. Validación de skills y referencias." },
  { step: "04", title: "Presentación", desc: "Shortlist de candidatos calificados con informe detallado para la empresa." },
  { step: "05", title: "Acompañamiento", desc: "Seguimiento durante el proceso de oferta, negociación e ingreso." },
];

export default function NosotrosClient() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B] py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl font-bold text-white sm:text-5xl">Quiénes somos</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#4FA3D1]/90 leading-relaxed">
              Somos una consultora de reclutamiento y selección que acompaña a las empresas en la
              identificación, atracción y selección del talento adecuado para sus equipos.
              Gestionamos procesos integrales tanto para posiciones IT como generales en LATAM.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 dark:bg-[#0a0f1a]">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-[#0B1F3B] dark:text-white sm:text-3xl">Nuestros valores</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2EC4B6]/10">
                  <v.icon className="h-5 w-5 text-[#2EC4B6]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#0B1F3B] dark:text-white">{v.title}</h3>
                <p className="mt-2 text-sm text-[#1F4E79]/70 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-gray-50 py-20 dark:bg-[#0d1520]">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-[#0B1F3B] dark:text-white sm:text-3xl">Nuestro proceso</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[#1F4E79]/70 dark:text-gray-400">
            Un proceso estructurado y transparente de principio a fin.
          </p>
          <div className="mt-12 space-y-6">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex gap-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5"
              >
                <span className="text-3xl font-bold text-[#2EC4B6]/30">{p.step}</span>
                <div>
                  <h3 className="text-lg font-bold text-[#0B1F3B] dark:text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-[#1F4E79]/70 dark:text-gray-400">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-20 dark:bg-[#0a0f1a]">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-[#2EC4B6]">IT & General</p>
              <p className="mt-2 text-sm text-[#1F4E79]/70 dark:text-gray-400">Perfiles que gestionamos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#2EC4B6]">LATAM</p>
              <p className="mt-2 text-sm text-[#1F4E79]/70 dark:text-gray-400">Alcance regional</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#2EC4B6]">USD</p>
              <p className="mt-2 text-sm text-[#1F4E79]/70 dark:text-gray-400">Compensación en dólares</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B1F3B] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">¿Buscás talento para tu equipo?</h2>
          <p className="mt-4 text-[#4FA3D1]/80">
            Contactanos y te ayudamos a encontrar al candidato ideal.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/busquedas" className="rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white hover:bg-[#26a89c]">
              Ver búsquedas activas
            </Link>
            <a href="https://www.linkedin.com/company/lupyx-talent/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-8 py-3 font-medium text-white hover:bg-white/5">
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
