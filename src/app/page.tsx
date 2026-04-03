import dynamic from "next/dynamic";
import PublicLayout from "@/components/PublicLayout";
import Hero from "@/components/Hero";
import ActiveSearches from "@/components/ActiveSearches";

// Lazy load below-the-fold sections for faster initial load
const CTABanner = dynamic(() => import("@/components/CTABanner"));
const TrustedBy = dynamic(() => import("@/components/TrustedBy"));
const AboutUs = dynamic(() => import("@/components/AboutUs"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const Contact = dynamic(() => import("@/components/Contact"));

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <ActiveSearches />
      <CTABanner />
      <TrustedBy />
      <AboutUs />
      <Testimonials />
      <FAQ />
      <Contact />
    </PublicLayout>
  );
}
