"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";

import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");
  const heroImage = PlaceHolderImages.find((img) => img.id === "about-hero");
  const storyImage = PlaceHolderImages.find((img) => img.id === "about-story");

  const partners = [
    { name: "Innovate Inc." },
    { name: "QuantumLeap" },
    { name: "Stellar Solutions" },
    { name: "Apex Enterprises" },
    { name: "Synergy Corp" },
    { name: "NextGen" },
    { name: "Pinnacle" },
    { name: "FusionWorks" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative h-screen flex items-end text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              quality={85}
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container pb-20 text-left">
            <h1 className="font-headline text-5xl font-bold tracking-tighter md:text-7xl">
              {t("mission")}
            </h1>
            <p className="mt-4 max-w-3xl font-body text-lg text-white/80 md:text-xl">
              {t("missionDesc")}
            </p>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-3 md:gap-12">
            <div className="md:col-span-1">
              <h2 className="font-headline text-4xl">{t("aboutUs")}</h2>
            </div>
            <div className="md:col-span-2">
              <p className="text-[28px] font-medium text-muted-foreground">
                {t("aboutUsDesc")}
              </p>
            </div>
          </div>
        </section>

        <div className="container">
          <Separator />
        </div>

        <section className="py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-4xl">{t("ourStory")}</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("storyP1")}
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("storyP2")}
              </p>
            </div>
            {storyImage && (
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image
                  src={storyImage.imageUrl}
                  alt={storyImage.description}
                  fill
                  quality={85}
                  className="object-cover"
                  data-ai-hint={storyImage.imageHint}
                />
              </div>
            )}
          </div>
        </section>

        <div className="container">
          <Separator />
        </div>

        <section className="py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-3 md:gap-12">
            <div className="md:col-span-1">
              <h2 className="font-headline text-4xl">{t("partners")}</h2>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 items-center mt-8 md:mt-0">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex justify-center items-center"
                >
                  <span className="font-headline text-2xl font-semibold text-muted-foreground/80">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container">
          <Separator />
        </div>

        <section className="container py-20 sm:py-32">
          <div className="grid grid-cols-1">
            <Card className="rounded-2xl bg-primary border-none">
              <CardContent className="p-12 text-center">
                <h2 className="font-headline text-4xl text-primary-foreground">
                  {t("joinTeam")}
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80 mx-auto">
                  {t("joinTeamDesc")}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 bg-white text-primary hover:bg-white/90"
                >
                  <Link href="/become-a-coach">
                    {t("becomeCoach")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
