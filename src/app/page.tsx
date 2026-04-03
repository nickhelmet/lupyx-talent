import PublicLayout from "@/components/PublicLayout";
import Hero from "@/components/Hero";
import ActiveSearches from "@/components/ActiveSearches";
import CTABanner from "@/components/CTABanner";
import TrustedBy from "@/components/TrustedBy";
import AboutUs from "@/components/AboutUs";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";

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
