import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0B1F3B] via-[#1F4E79] to-[#0B1F3B] px-4">
      <img src="/logo.webp" alt="Lupyx Talent" className="h-16 rounded-xl bg-white/10 p-1.5" />
      <h1 className="mt-8 text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-lg text-[#4FA3D1]/80">
        La página que buscás no existe.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white transition-all hover:bg-[#26a89c]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
