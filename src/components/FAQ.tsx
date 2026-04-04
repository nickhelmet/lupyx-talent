"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Cómo puedo postularme a una búsqueda?",
    a: "Hacé click en 'Postularme' en cualquier búsqueda activa. Necesitás iniciar sesión con tu cuenta de Google, completar tus datos y subir tu CV en PDF.",
  },
  {
    q: "¿Cuánto dura el proceso de selección?",
    a: "Depende de la búsqueda, pero generalmente entre 2 y 4 semanas. Incluye revisión de CV, entrevistas técnicas y culturales, y oferta.",
  },
  {
    q: "¿La compensación es en USD?",
    a: "Sí, todas nuestras búsquedas ofrecen compensación en dólares estadounidenses. El monto específico se discute durante el proceso.",
  },
  {
    q: "¿Mis datos son confidenciales?",
    a: "Absolutamente. Solo compartimos tu perfil con las empresas a las que te postulás. No vendemos ni compartimos datos con terceros.",
  },
  {
    q: "¿Puedo postularme a varias búsquedas?",
    a: "Sí, podés postularte a todas las búsquedas que te interesen. Cada postulación se gestiona de forma independiente.",
  },
  {
    q: "¿Cómo sé en qué etapa está mi postulación?",
    a: "En 'Mi cuenta' podés ver el estado de todas tus postulaciones con una barra de progreso: Postulado → En revisión → Entrevista → Resultado.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-[#f8fafb] py-20 dark:bg-[#0d1520] sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-4 py-1 text-sm font-semibold text-[#2EC4B6]">FAQ</span>
          <h2 className="mt-4 text-3xl font-bold text-[#0B1F3B] dark:text-white sm:text-4xl">Preguntas frecuentes</h2>
        </motion.div>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/5"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#1F4E79]/40 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-[#1F4E79]/70 dark:text-gray-400">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
