"use client";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { useLanguage } from "@/contexts/language-context";
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
  const { isFrench } = useLanguage();
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
      title: (
        <>
          Vetted <span className="notranslate">{isFrench ? "Coachs" : "Coaches"}</span>, Proven Results
        </>
      ),
      description:
        "Our coaches are industry leaders with years of experience in their respective fields.",
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
      title: "Personalized Learning Paths",
      description:
        "Tailored guidance to help you achieve your specific career goals and aspirations.",
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
      title: "Flexible Scheduling & Support",
      description:
        "Book sessions that fit your schedule and get support from our dedicated team.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      role: "UX Designer",
      testimonial:
        "Nebula connected me with a fantastic coach who helped me land my dream job. The personalized advice was a game-changer!",
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-1"),
    },
    {
      name: "David L.",
      role: "Software Engineer",
      testimonial:
        "The mock interviews were incredibly realistic. I felt so much more confident going into the real thing. Highly recommend!",
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-2"),
    },
    {
      name: "Emily R.",
      role: "Product Manager",
      testimonial:
        "I was feeling stuck in my career. My coach provided the clarity and strategy I needed to move forward. Thank you, Nebula!",
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-3"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <section className="bg-muted py-20 sm:py-32">
          <div className="container">
            <p className="max-w-4xl text-center mx-auto text-[28px] font-medium text-muted-foreground leading-snug">
                We’re not just an AI platform. Our qualified coaches work alongside you, offering expert guidance that elevates your experience and accelerates your growth.
            </p>
          </div>
        </section>
        <CompanyLogosSection />
        <NetworkSection />
        <PopularProgramsSection />
        <UpcomingEventsSection />
        <TestimonialsSection testimonials={testimonials} />
        <FeaturesSection cards={featureCards} />
      </main>
      <Footer />
    </div>
  );
}
