"use client";
import {
  BrainCircuit,
  CheckCircle,
  HeartHandshake,
  Lightbulb,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Separator } from "@/components/ui/separator";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";

import { useTranslations } from "next-intl";

export default function CareersPage() {
  const t = useTranslations("careers");
  const heroImage = PlaceHolderImages.find((img) => img.id === "careers-hero");
  const lifeAtNebulaImage = PlaceHolderImages.find(
    (img) => img.id === "careers-life",
  );

  const values = [
    {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: t("valueItems.mission.title"),
      description: t("valueItems.mission.description"),
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-blue-500" />,
      title: t("valueItems.student.title"),
      description: t("valueItems.student.description"),
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
      title: t("valueItems.innovation.title"),
      description: t("valueItems.innovation.description"),
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      title: t("valueItems.ownership.title"),
      description: t("valueItems.ownership.description"),
    },
  ];

  const benefits = [
    t("benefitItems.salary"),
    t("benefitItems.health"),
    t("benefitItems.remote"),
    t("benefitItems.leave"),
    t("benefitItems.stipend"),
    t("benefitItems.retreat"),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] flex items-center justify-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container text-center">
            <h1 className="font-headline text-5xl font-bold tracking-tighter md:text-7xl">
              {t("joinMission")}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto font-body text-lg text-white/80 md:text-xl">
              {t("joinMissionDesc")}
            </p>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container text-center">
            <h2 className="font-headline text-4xl">{t("values")}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
              {t("valuesDesc")}
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                    {value.icon}
                  </div>
                  <h3 className="mt-4 font-headline text-xl font-semibold">
                    {value.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container">
          <Separator />
        </div>

        <section id="open-roles" className="py-20 sm:py-32">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">{t("openRoles")}</h2>
              <p className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
                {t("noOpenRoles")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-4xl">{t("lifeAtNebula")}</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("lifeDesc")}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            {lifeAtNebulaImage && (
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <Image
                  src={lifeAtNebulaImage.imageUrl}
                  alt={lifeAtNebulaImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={lifeAtNebulaImage.imageHint}
                  unoptimized
                />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
