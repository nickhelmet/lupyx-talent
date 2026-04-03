import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import NosotrosClient from "./NosotrosClient";

export const metadata: Metadata = {
  title: "Quiénes somos | Lupyx Talent",
  description: "Consultora de reclutamiento y selección en LATAM. Nuestros valores, proceso de selección y equipo.",
  openGraph: {
    title: "Quiénes somos | Lupyx Talent",
    description: "Conocé nuestro proceso de selección, valores y cómo conectamos talento con oportunidades.",
    url: "https://lupyxtalent.com/nosotros/",
  },
};

export default function NosotrosPage() {
  return (
    <PublicLayout>
      <NosotrosClient />
    </PublicLayout>
  );
}
