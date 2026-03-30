"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Lupyx Talent entendió exactamente el perfil técnico que necesitábamos. En menos de tres semanas teníamos al candidato ideal incorporado al equipo.",
    name: "Martín R.",
    role: "CTO",
    company: "Startup tecnológica",
  },
  {
    quote:
      "Lo que más valoro es la transparencia del proceso. Siempre supe en qué etapa estaba mi postulación y recibí feedback genuino en cada instancia.",
    name: "Lucía G.",
    role: "Senior Developer",
    company: "Candidata",
  },
  {
    quote:
      "Trabajar con Lupyx fue una experiencia diferente. Se nota que priorizan la calidad del match por sobre llenar vacantes rápidamente.",
    name: "Carolina S.",
    role: "HR Director",
    company: "Empresa regional",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="bg-[#0B1F3B] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-4 py-1 text-sm font-semibold text-[#2EC4B6]">
            Testimonios
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Lo que dicen de nosotros
          </h2>
        </motion.div>

        <div
          className="relative mt-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <Quote className="mx-auto h-10 w-10 text-[#2EC4B6]/30" />
                <blockquote className="mt-6 text-xl leading-relaxed font-light text-white/90 sm:text-2xl">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </blockquote>
                <div className="mt-8">
                  <p className="text-base font-semibold text-[#2EC4B6]">
                    {testimonials[current].name}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {testimonials[current].role} · {testimonials[current].company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-[#2EC4B6]/50 hover:text-[#2EC4B6]"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current
                      ? "w-6 bg-[#2EC4B6]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Ir al testimonio ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-[#2EC4B6]/50 hover:text-[#2EC4B6]"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
