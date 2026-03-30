import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lupyx Talent | Conectando talento con oportunidades",
  description:
    "Consultora de reclutamiento y selección. Gestionamos procesos integrales para posiciones IT y generales en LATAM, priorizando la experiencia del candidato.",
  keywords: [
    "reclutamiento",
    "selección",
    "talento",
    "RRHH",
    "IT",
    "LATAM",
    "Lupyx Talent",
    "empleo",
    "búsqueda laboral",
  ],
  openGraph: {
    title: "Lupyx Talent | Conectando talento con oportunidades",
    description:
      "Consultora de reclutamiento y selección en LATAM. Procesos integrales para posiciones IT y generales.",
    url: "https://lupyxtalent.com",
    siteName: "Lupyx Talent",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lupyx Talent",
    description: "Conectando talento con oportunidades",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
