"use client";
import React from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { useTranslations } from "next-intl";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { NetworkSection } from "@/components/sections/network-section";
import { PopularProgramsSection } from "@/components/sections/popular-programs-section";
import { UpcomingEventsSection } from "@/components/sections/upcoming-events-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CompanyLogosSection } from "@/components/sections/company-logo-section";

export default function Home() {
  const t = useTranslations("home");

  const featureCards = [
    {
      icon: (
        <Image
          src="/custom-images/check-mark.svg"
          alt="Check mark"
          width={32}
          height={32}
        />
      ),
      title: t("features.vetted.title"),
      description: t("features.vetted.description"),
    },
    {
      icon: (
        <Image
          src="/custom-images/learning-path.svg"
          alt="Learning Path"
          width={32}
          height={32}
        />
      ),
      title: t("features.personalized.title"),
      description: t("features.personalized.description"),
      customStyle: { backgroundColor: "rgba(255, 75, 0, 0.3)" },
    },
    {
      icon: (
        <Image
          src="/custom-images/calendar.svg"
          alt="Calendar"
          width={32}
          height={32}
        />
      ),
      title: t("features.flexible.title"),
      description: t("features.flexible.description"),
    },
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      role: t("testimonials.sarah.role"),
      testimonial: t("testimonials.sarah.content"),
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-1"),
    },
    {
      name: "David L.",
      role: t("testimonials.david.role"),
      testimonial: t("testimonials.david.content"),
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-2"),
    },
    {
      name: "Emily R.",
      role: t("testimonials.emily.role"),
      testimonial: t("testimonials.emily.content"),
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-3"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection cards={featureCards as any} />
        <CompanyLogosSection />
        <NetworkSection />
        <PopularProgramsSection />
        <UpcomingEventsSection />
        <TestimonialsSection testimonials={testimonials} />
      </main>
      <Footer />
    </div>
  );
}
