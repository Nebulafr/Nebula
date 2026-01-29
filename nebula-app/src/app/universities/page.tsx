"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from "@/lib/images/placeholder-images";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";
import { universityLogosArray } from "@/lib/images/universities";
import { Header } from "@/components/layout/header";

export default function UniversitiesPage() {
  const t = useTranslations("universities");
  const schoolLogos = universityLogosArray;

  const benefits = [
    {
      icon: "/custom-images/career-prep.svg",
      title: t("benefits.employability.title"),
      description: t("benefits.employability.description"),
      color: "bg-primary/10",
    },
    {
      icon: "/custom-images/school.svg",
      title: t("benefits.alumni.title"),
      description: t("benefits.alumni.description"),
      color: "bg-blue-500/10",
    },
    {
      icon: "/custom-images/get-matched.svg",
      title: t("benefits.scale.title"),
      description: t("benefits.scale.description"),
      color: "bg-purple-500/10",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      step: 2,
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      step: 3,
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
    },
  ];

  const faqs = [
    {
      question: t("faqs.q1.question"),
      answer: t("faqs.q1.answer"),
    },
    {
      question: t("faqs.q2.question"),
      answer: t("faqs.q2.answer"),
    },
    {
      question: t("faqs.q3.question"),
      answer: t("faqs.q3.answer"),
    },
  ];

  const videoImage = PlaceHolderImages.find(
    (img: ImagePlaceholder) => img.id === "about-story",
  );
  const problemImage = PlaceHolderImages.find(
    (img: ImagePlaceholder) => img.id === "about-hero",
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-20 text-center md:py-32">
          <h1 className="font-headline text-6xl font-bold tracking-tighter text-primary md:text-8xl">
            {t("title")}
          </h1>
          <h1 className="font-headline text-6xl font-bold tracking-tighter text-muted-foreground md:text-8xl">
            {t("subtitle")}
          </h1>
        </section>

        <section className="py-12 bg-primary/5">
          <div className="container text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("inConversation")}
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {schoolLogos.map((logo) => (
                <div key={logo.name} className="flex justify-center">
                  <Image
                    src={logo.url}
                    alt={logo.name}
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/10 border-none rounded-xl p-12 flex flex-col justify-center">
              <CardContent className="p-0">
                <div className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {t("problem.title")}
                </div>
                <p className="mt-4 text-lg text-muted-foreground">
                  {t("problem.p1")}
                </p>
                <p className="mt-4 text-lg text-muted-foreground">
                  {t("problem.p2")}
                </p>
              </CardContent>
            </Card>
            {problemImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                  src={problemImage.imageUrl}
                  alt={problemImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={problemImage.imageHint}
                />
              </div>
            )}
          </div>
        </section>

        <section className="pb-20 sm:pb-32">
          <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 py-12">
              <h2 className="font-headline text-4xl">{t("solution.title")}</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("solution.p1")}
              </p>
            </div>
            <div className="md:col-span-3">
              <Card className="h-full rounded-xl">
                <CardContent className="p-12">
                  <p className="text-lg text-muted-foreground">
                    {t("solution.p2")}
                  </p>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {t("solution.p3")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-20 sm:py-32">
          <div className="container">
            <div className="mb-12 text-left">
              <h2 className="font-headline text-4xl">{t("benefits.title")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="p-8 bg-white shadow-none border-none rounded-xl text-left"
                >
                  <CardContent className="p-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${benefit.color}`}
                    >
                      <Image
                        src={benefit.icon}
                        alt={benefit.title}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="mt-6 font-headline text-2xl font-semibold">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-base text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">
                {t("howItWorks.title")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="flex flex-col items-center text-center z-10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg border-4 border-background">
                    {step.step}
                  </div>
                  <h3 className="mt-4 font-headline text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground py-20 sm:py-32">
          <div className="container text-center">
            <h2 className="font-headline text-4xl md:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
              {t("cta.description")}
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                {t("cta.button")}
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">
                {t("oneMoreThing.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("oneMoreThing.description")}
              </p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden group mt-8">
              {videoImage && (
                <Image
                  src={videoImage.imageUrl}
                  alt={videoImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={videoImage.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="h-40 w-40 text-white/80 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-20 sm:py-32">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">{t("faqs.title")}</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pl-4 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container text-center">
            <h2 className="font-headline text-4xl md:text-5xl">
              {t("nextStep.title")}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              {t("nextStep.description")}
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/help-center/contact">{t("nextStep.button")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
