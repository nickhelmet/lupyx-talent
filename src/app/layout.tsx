import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ToastProvider } from "@/components/Toast";
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
    "Argentina",
    "remoto",
  ],
  metadataBase: new URL("https://lupyxtalent.com"),
  openGraph: {
    title: "Lupyx Talent | Conectando talento con oportunidades",
    description:
      "Consultora de reclutamiento y selección en LATAM. Procesos integrales para posiciones IT y generales.",
    url: "https://lupyxtalent.com",
    siteName: "Lupyx Talent",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lupyx Talent - Conectando talento con oportunidades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lupyx Talent",
    description: "Conectando talento con oportunidades",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lupyx Talent",
  description:
    "Consultora de reclutamiento y selección que acompaña a empresas en la identificación, atracción y selección del talento adecuado.",
  url: "https://lupyxtalent.com",
  logo: "https://lupyxtalent.com/logo.jpg",
  sameAs: [
    "https://www.linkedin.com/company/lupyx-talent/",
    "https://www.instagram.com/lupyx.talent",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "jm@lupyxtalent.com",
    contactType: "recruitment",
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
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#0B1F3B] dark:bg-[#0a0f1a] dark:text-gray-100">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-[#2EC4B6] focus:px-4 focus:py-2 focus:text-sm focus:text-white">
          Saltar al contenido
        </a>
        <ThemeScript />
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              {children}
              <WhatsAppButton />
              <CookieConsent />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('lupyx-theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      } catch(e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
