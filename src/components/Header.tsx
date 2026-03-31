"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#busquedas", label: "Búsquedas" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm dark:bg-[#0a0f1a]/90"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="Lupyx Talent"
              className="h-10 w-auto sm:h-12"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#1F4E79] transition-colors hover:text-[#2EC4B6] dark:text-gray-300"
              >
                {link.label}
              </a>
            ))}
            <ThemeToggle />
            <a
              href="#busquedas"
              className="rounded-full bg-[#2EC4B6] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#26a89c] hover:shadow-lg"
            >
              Ver búsquedas
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#0B1F3B] dark:text-gray-300"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/95 backdrop-blur-md dark:bg-[#0a0f1a]/95 md:hidden"
          >
            <nav className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-[#1F4E79] transition-colors hover:text-[#2EC4B6]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#busquedas"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 rounded-full bg-[#2EC4B6] px-5 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#26a89c]"
              >
                Ver búsquedas
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
