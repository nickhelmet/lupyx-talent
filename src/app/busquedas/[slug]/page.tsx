import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import JobDetailClient from "./JobDetailClient";

const jobMeta: Record<string, { title: string; company: string; location: string }> = {
  "senior-backend-java": { title: "Senior Backend Engineer", company: "Empresa confidencial", location: "Buenos Aires / Santa Fe" },
  "senior-marketing-designer": { title: "Senior Marketing Designer", company: "Startup AI", location: "Remoto LATAM" },
};

export function generateStaticParams() {
  return Object.keys(jobMeta).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const job = jobMeta[params.slug];
  if (!job) return { title: "Búsqueda | Lupyx Talent" };

  return {
    title: `${job.title} — ${job.company} | Lupyx Talent`,
    description: `${job.title} en ${job.company}. ${job.location}. Postulate en Lupyx Talent — Conectando talento con oportunidades.`,
    openGraph: {
      title: `${job.title} — ${job.company}`,
      description: `Búsqueda activa: ${job.title} en ${job.location}. Compensación en USD.`,
      url: `https://lupyxtalent.com/busquedas/${params.slug}/`,
    },
  };
}

export default function JobDetailPage() {
  return (
    <PublicLayout>
      <JobDetailClient />
    </PublicLayout>
  );
}
