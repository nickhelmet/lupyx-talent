import PublicLayout from "@/components/PublicLayout";
import Hero from "@/components/Hero";
import ActiveSearches from "@/components/ActiveSearches";
import TrustedBy from "@/components/TrustedBy";
import AboutUs from "@/components/AboutUs";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <ActiveSearches />
      <TrustedBy />
      <AboutUs />
      <Testimonials />
      <Contact />
    </PublicLayout>
  );
}
