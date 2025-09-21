import React from "react";
import Services from "@/components/services/services";
import Hero from "@/components/services/hero";
import SponsorCarousel from "@/components/hero/sponsor-carousel";
import CTA from "@/components/hero/cta";
export default function page() {
  return (
    <div>
      <Hero />
      <CTA />
      <SponsorCarousel />
      <Services />
    </div>
  );
}
