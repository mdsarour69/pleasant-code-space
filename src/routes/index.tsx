import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { TrialSection } from "@/components/home/TrialSection";
import { PricingSection } from "@/components/home/PricingSection";
import { ContactSection, Footer, FloatingSupport } from "@/components/home/ContactFooter";
import { Suspense } from "react";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTranslations } from "@/lib/data.functions";
import { useTranslationStore } from "@/lib/translations/store";
import { isEnabled, orderedSections, safeColor, SITE_DEFAULTS } from "@/lib/site-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ITFair — Authorized Digital Services" },
      { name: "description", content: "Digital services, extension access and flexible packages from ITFair." },
      { property: "og:title", content: "ITFair — Authorized Digital Services" },
      { property: "og:description", content: "Digital services, extension access and flexible packages from ITFair." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function SiteContent() {
  const { currentLang, _hasHydrated } = useTranslationStore();
  const activeLang = _hasHydrated ? currentLang : "bn";
  const { data: settings } = useSuspenseQuery({
    queryKey: ["translations", activeLang],
    queryFn: () => getTranslations({ data: { lang: activeLang } }),
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", safeColor(settings["theme_primary"], SITE_DEFAULTS.theme_primary));
    root.style.setProperty("--background", safeColor(settings["theme_background"], SITE_DEFAULTS.theme_background));
    root.style.setProperty("--surface", safeColor(settings["theme_surface"], SITE_DEFAULTS.theme_surface));
    root.style.setProperty("--foreground", safeColor(settings["theme_foreground"], SITE_DEFAULTS.theme_foreground));
    root.style.setProperty("--muted-foreground", safeColor(settings["theme_muted"], SITE_DEFAULTS.theme_muted));
    root.style.setProperty("--border", safeColor(settings["theme_border"], SITE_DEFAULTS.theme_border));
    const serviceGrid = settings["service_grid"] ?? SITE_DEFAULTS.service_grid;
    const packageGrid = settings["package_grid"] ?? SITE_DEFAULTS.package_grid;
    root.style.setProperty("--service-columns", ["2", "3", "4"].includes(serviceGrid) ? serviceGrid : "3");
    root.style.setProperty("--package-columns", ["2", "3", "4"].includes(packageGrid) ? packageGrid : "3");
    root.dataset["contentWidth"] = settings["content_width"] === "compact" ? "compact" : "wide";
    root.dataset["density"] = settings["spacing_density"] === "compact" ? "compact" : "comfortable";
    root.dataset["corners"] = settings["corner_style"] === "square" ? "square" : "soft";
    root.dataset["buttonStyle"] = settings["button_style"] === "square" ? "square" : "pill";
    return () => {
      for (const key of ["--primary", "--background", "--surface", "--foreground", "--muted-foreground", "--border", "--service-columns", "--package-columns"]) root.style.removeProperty(key);
      delete root.dataset["contentWidth"];
      delete root.dataset["density"];
      delete root.dataset["corners"];
      delete root.dataset["buttonStyle"];
    };
  }, [settings]);

  const sections = orderedSections(settings);
  return (
    <>
      <Hero showServices={isEnabled(settings, "show_services")} />
      {sections.map((section) => {
        if (section === "trial" && isEnabled(settings, "show_trial")) return <TrialSection key={section} />;
        if (section === "packages" && isEnabled(settings, "show_packages")) return <PricingSection key={section} />;
        if (section === "contact" && isEnabled(settings, "show_contact")) return <ContactSection key={section} />;
        return null;
      })}
    </>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <Navbar />
      </Suspense>
      
      <main>
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          <SiteContent />
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
        <FloatingSupport />
      </Suspense>
    </div>
  );
}
