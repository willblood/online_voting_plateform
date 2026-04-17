import type { Route } from "./+types/home";
import { Navbar } from "../features/landing/Navbar.js";
import { HeroSection } from "../features/landing/HeroSection.js";
import { StatsBand } from "../features/landing/StatsBand.js";
import { FeaturesSection } from "../features/landing/FeaturesSection.js";
import { HowItWorks } from "../features/landing/HowItWorks.js";
import { CTASection } from "../features/landing/CTASection.js";
import { LandingFooter } from "../features/landing/LandingFooter.js";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "VOTI CI — Excellence Électorale en Côte d'Ivoire" },
    {
      name: "description",
      content:
        "La plateforme électorale numérique sécurisée qui garantit la transparence et l'intégrité de chaque voix en Côte d'Ivoire.",
    },
  ];
}

export default function Home() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsBand />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
