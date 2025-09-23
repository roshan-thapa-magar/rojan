import React from "react";
import Header from "@/components/hero/header";
import Footer from "@/components/hero/footer";
import Hero from "@/components/hero/hero";
import About from "@/components/hero/about";
import Services from "@/components/hero/services";
import TeamSection from "@/components/hero/team-section";
import Testimonials from "@/components/hero/testimonials";
import CTA from "@/components/hero/cta";
import Blog from "@/components/hero/blog";
import SponsorCarousel from "@/components/hero/sponsor-carousel";

export default function page() {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <Services />
      <TeamSection />
      <Testimonials />
      <CTA />
      <Blog />
      <SponsorCarousel />
      <Footer />
    </div>
  );
}
