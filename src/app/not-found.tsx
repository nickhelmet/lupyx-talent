import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-32">
        <h1 className="text-6xl font-bold text-[#0B1F3B] dark:text-white">404</h1>
        <p className="mt-4 text-lg text-[#1F4E79]/70 dark:text-gray-400">
          La página que buscás no existe.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-[#2EC4B6] px-8 py-3 font-semibold text-white transition-all hover:bg-[#26a89c]"
        >
          Volver al inicio
        </Link>
      </div>
    </PublicLayout>
  );
}
