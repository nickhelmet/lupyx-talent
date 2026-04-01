"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { track } from "@/lib/analytics";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

const contactLinks = [
  {
    icon: LinkedInIcon,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/lupyx-talent/",
    color: "hover:text-[#0077B5]",
    bgHover: "hover:bg-[#0077B5]/10",
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    href: "https://www.instagram.com/lupyx.talent",
    color: "hover:text-[#E4405F]",
    bgHover: "hover:bg-[#E4405F]/10",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:jm@lupyxtalent.com",
    color: "hover:text-[#2EC4B6]",
    bgHover: "hover:bg-[#2EC4B6]/10",
  },
];

export default function Contact() {
  return (
    <section id="contacto" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-4 py-1 text-sm font-semibold text-[#2EC4B6]">
            Contacto
          </span>
          <h2 className="mt-4 text-3xl font-bold text-[#0B1F3B] dark:text-white sm:text-4xl">
            ¿Hablamos?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#1F4E79]/70 dark:text-gray-400">
            Ya sea que busques talento para tu equipo o estés explorando nuevas
            oportunidades, nos encantaría conectar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8"
        >
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={
                link.href.startsWith("mailto")
                  ? undefined
                  : "noopener noreferrer"
              }
              onClick={() => track.contactClick(link.label)}
              className={`group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:bg-white/5 ${link.bgHover}`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-[#1F4E79]/60 transition-colors ${link.color}`}
              >
                <link.icon className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-[#0B1F3B] dark:text-white">
                {link.label}
              </span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
