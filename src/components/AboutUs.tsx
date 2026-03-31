"use client";

import { motion } from "framer-motion";
import { Users, Target, Globe, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Target,
    title: "Selección estratégica",
    description:
      "Procesos integrales alineados con la cultura y objetivos de cada organización.",
  },
  {
    icon: Users,
    title: "IT y perfiles generales",
    description:
      "Expertise en tecnología, marketing, diseño y roles operativos.",
  },
  {
    icon: Globe,
    title: "Alcance LATAM",
    description:
      "Conectamos talento en toda la región con oportunidades globales.",
  },
  {
    icon: Sparkles,
    title: "Experiencia del candidato",
    description:
      "Priorizamos un proceso humano, ágil y transparente para cada postulante.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutUs() {
  return (
    <section id="nosotros" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-4 py-1 text-sm font-semibold text-[#2EC4B6]">
              Sobre nosotros
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0B1F3B] dark:text-white sm:text-4xl">
              Quiénes somos
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#1F4E79]/80 dark:text-gray-300">
              Somos una consultora de reclutamiento y selección que acompaña a
              las empresas en la identificación, atracción y selección del
              talento adecuado para sus equipos.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#1F4E79]/80 dark:text-gray-300">
              Gestionamos procesos integrales tanto para posiciones IT como
              generales, priorizando la calidad de la experiencia del candidato y
              el alineamiento con el negocio.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <a
                href="https://www.linkedin.com/company/lupyx-talent/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#0B1F3B] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1F4E79]"
              >
                Conocenos en LinkedIn
              </a>
            </div>
          </motion.div>

          {/* Highlights grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 gap-4"
          >
            {highlights.map((h) => (
              <motion.div
                key={h.title}
                variants={item}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:shadow-[#2EC4B6]/5 dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2EC4B6]/10 to-[#4FA3D1]/10">
                  <h.icon className="h-5 w-5 text-[#2EC4B6]" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1F3B] dark:text-white">{h.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#1F4E79]/60 dark:text-gray-400">
                  {h.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
