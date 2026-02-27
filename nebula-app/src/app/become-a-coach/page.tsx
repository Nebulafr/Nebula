 
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  HeartHandshake,
  Linkedin,
  LogOut,
  Twitter,
  Users,
  Wallet,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useTranslations } from "next-intl";

export default function BecomeACoachPage() {
  const t = useTranslations("becomeCoach");

  const howItWorks = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
    },
    {
      icon: <Users className="h-8 w-8 text-yellow-500" />,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
    },
    {
      icon: <Wallet className="h-8 w-8 text-green-500" />,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
    },
  ];

  const testimonials = [
    {
      name: t("testimonials.jack.name"),
      role: t("testimonials.jack.role"),
      testimonial: t("testimonials.jack.quote"),
      avatar: "https://i.pravatar.cc/40?u=jack-hugo",
    },
    {
      name: t("testimonials.sarah.name"),
      role: t("testimonials.sarah.role"),
      testimonial: t("testimonials.sarah.quote"),
      avatar: "https://i.pravatar.cc/40?u=sarah-cuoco",
    },
  ];

  const benefits = [
    {
      icon: <Wallet className="h-10 w-10 text-primary" />,
      title: t("benefits.incomeTitle"),
      description: t("benefits.incomeDesc"),
      color: "bg-green-50",
      image: PlaceHolderImages.find((img) => img.id === "benefit-income"),
    },
    {
      icon: <CalendarDays className="h-10 w-10 text-blue-500" />,
      title: t("benefits.scheduleTitle"),
      description: t("benefits.scheduleDesc"),
      color: "bg-blue-50",
      image: PlaceHolderImages.find((img) => img.id === "benefit-schedule"),
    },
    {
      icon: <HeartHandshake className="h-10 w-10 text-purple-500" />,
      title: t("benefits.impactTitle"),
      description: t("benefits.impactDesc"),
      color: "bg-purple-50",
      image: PlaceHolderImages.find((img) => img.id === "benefit-impact"),
    },
  ];

  const heroImage = PlaceHolderImages.find((img) => img.id === "coach-hero");


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-20 text-center md:py-32">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-7xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70 md:text-xl">
            {t("subtitle")}
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/coach-signup">{t("cta")}</Link>
            </Button>
          </div>
        </section>

        <section className="container">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              width={1200}
              height={300}
              quality={85}
              className="w-full rounded-[30px] object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
        </section>

        <section className="container py-20 sm:py-32">
          <div className="grid gap-12 md:grid-cols-3 text-center">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  {step.icon}
                </div>
                <h3 className="font-headline text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-base text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary/5 py-20 sm:py-32">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">
                {t("testimonials.title")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="p-8 bg-white shadow-none border-none rounded-xl"
                >
                  <CardContent className="p-0">
                    <p className="text-lg text-foreground/80 font-serif">
                      &quot;{testimonial.testimonial}&quot;
                    </p>
                    <div className="flex items-center gap-4 mt-6">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-headline text-lg font-semibold">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container">
            <div className="text-left mb-12">
              <h2 className="font-headline text-4xl">
                {t("benefits.title")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {benefits.map((benefit, i) => (
                <Card
                  key={i}
                  className={`overflow-hidden rounded-xl border-none ${benefit.color}`}
                >
                  {benefit.image && (
                    <div className="flex justify-center items-center p-8 h-48">
                      <Image
                        src={benefit.image.imageUrl}
                        alt={benefit.image.description}
                        width={
                          benefit.image.id === "benefit-schedule" ? 200 : 150
                        }
                        height={150}
                        quality={85}
                        className="object-contain"
                        data-ai-hint={benefit.image.imageHint}
                      />
                    </div>
                  )}
                  <CardContent className="p-6 bg-white rounded-t-xl">
                    <h3 className="font-headline text-xl font-semibold">
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

        <section className="container pb-20 sm:pb-32">
          <div className="grid grid-cols-5 bg-yellow-50/50 overflow-hidden rounded-xl h-[200px]">
            <div className="order-1 md:col-span-2 bg-gray-200" />
            <div className="order-2 md:col-span-3 flex flex-col justify-center p-8 sm:p-16 text-left h-[200px]">
              <h2 className="font-headline text-4xl font-semibold">
                {t("network.title")}
              </h2>
              <h2 className="font-headline text-4xl mt-2 font-normal text-muted-foreground">
                {t("network.subtitle")}
              </h2>
              <Link
                href="/coach-signup"
                className="inline-flex items-center text-primary font-semibold mt-6"
              >
                {t("cta")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
