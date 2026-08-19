import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { TrialSection } from "@/components/home/TrialSection";
import { PricingSection } from "@/components/home/PricingSection";
import { ContactSection, Footer, FloatingSupport } from "@/components/home/ContactFooter";
import { Suspense } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#080512]">
      <Suspense fallback={<div className="h-16 bg-[#080512]" />}>
        <Navbar />
      </Suspense>
      
      <main>
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          <Hero />
          <TrialSection />
          <PricingSection />
          <ContactSection />
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
        <FloatingSupport />
      </Suspense>
    </div>
  );
}
