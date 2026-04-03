import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import JobListClient from "./JobListClient";

export const metadata: Metadata = {
  title: "Búsquedas activas | Lupyx Talent",
  description: "Explorá las oportunidades laborales activas en IT y perfiles generales. Compensación en USD. LATAM.",
  openGraph: {
    title: "Búsquedas activas | Lupyx Talent",
    description: "Oportunidades laborales IT y generales en LATAM con compensación en USD.",
    url: "https://lupyxtalent.com/busquedas/",
  },
};

export default function BusquedasPage() {
  return (
    <PublicLayout>
      <JobListClient />
    </PublicLayout>
  );
}
