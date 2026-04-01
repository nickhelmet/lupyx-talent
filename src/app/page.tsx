import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ActiveSearches from "@/components/ActiveSearches";
import AboutUs from "@/components/AboutUs";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <ActiveSearches />
        <AboutUs />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
