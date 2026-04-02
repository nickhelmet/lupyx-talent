import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white dark:border-white/10 dark:bg-[#0a0f1a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img src="/logo.webp" alt="Lupyx Talent" className="h-10 w-auto" />
            <p className="mt-3 text-sm text-[#1F4E79]/60 dark:text-gray-500">
              Conectando talento con oportunidades en LATAM.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://www.linkedin.com/company/lupyx-talent/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-[#1F4E79]/50 transition-all hover:bg-[#0077B5]/10 hover:text-[#0077B5] dark:bg-white/5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://www.instagram.com/lupyx.talent" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-[#1F4E79]/50 transition-all hover:bg-[#E4405F]/10 hover:text-[#E4405F] dark:bg-white/5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>

          {/* Candidatos */}
          <div>
            <h3 className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Candidatos</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/busquedas" className="text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">Búsquedas activas</Link></li>
              <li><Link href="/mi-cuenta" className="text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">Mi cuenta</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Empresa</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/nosotros" className="text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">Sobre nosotros</Link></li>
              <li><a href="https://www.linkedin.com/company/lupyx-talent/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">LinkedIn</a></li>
              <li><a href="https://www.instagram.com/lupyx.talent" target="_blank" rel="noopener noreferrer" className="text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">Instagram</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Contacto</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="mailto:jm@lupyxtalent.com" className="text-sm text-[#1F4E79]/70 hover:text-[#2EC4B6] dark:text-gray-400">jm@lupyxtalent.com</a></li>
              <li><span className="text-sm text-[#1F4E79]/70 dark:text-gray-400">Argentina · LATAM</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 dark:border-white/10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-[#1F4E79]/40 dark:text-gray-600">
              © {new Date().getFullYear()} Lupyx Talent. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/terminos" className="text-xs text-[#1F4E79]/40 hover:text-[#2EC4B6] dark:text-gray-600">Términos</Link>
              <Link href="/privacidad" className="text-xs text-[#1F4E79]/40 hover:text-[#2EC4B6] dark:text-gray-600">Privacidad</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
