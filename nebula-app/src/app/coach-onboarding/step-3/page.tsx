/* eslint-disable */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingStep3Schema,
  type CoachOnboardingStep3Data,
} from "@/lib/validations";
import { Label } from "@/components/ui/label";

function CoachOnboardingStep3Content() {
  const t = useTranslations("common.onboarding.coach.step3");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "benefit-impact");

  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const company = searchParams.get("company");
  const linkedin = searchParams.get("linkedin");
  const specialties = searchParams.get("specialties");

  const {
    register,
    formState: { errors, isValid },
    watch,
  } = useForm<CoachOnboardingStep3Data>({
    resolver: zodResolver(coachOnboardingStep3Schema),
    mode: "onChange",
    defaultValues: {
      motivation: "",
    },
  });
  const motivation = watch("motivation");
  const charCount = motivation.length;

  const nextStepUrl = `/coach-onboarding/step-4?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(
    specialties || ""
  )}&motivation=${encodeURIComponent(motivation)}`;

  const prevStepUrl = `/coach-onboarding/step-2?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(specialties || "")}`;

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-5 bg-background">
      <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block overflow-hidden">
        {image && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            quality={85}
            className="object-cover scale-105 transition-transform duration-1000 hover:scale-110"
            data-ai-hint={image.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-5xl font-bold tracking-tight">{t("title")}</h2>
          <p className="mt-4 max-w-lg text-lg text-white/80 leading-relaxed font-light">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

        <div className="mx-auto grid w-full max-w-md gap-8 px-6">
          <div className="space-y-2">
            <Progress value={60} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span>Basic Info</span>
              <span>Specialties</span>
              <span className="text-primary font-bold">Motivation</span>
              <span>Style</span>
              <span>Final</span>
            </div>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t("heading")}
              </CardTitle>
              <CardDescription className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("subheading")}{" "}
                <span className="text-destructive">*</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-0 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <div className="grid gap-3 group">
                <div className="flex justify-between items-end mb-1">
                  <Label htmlFor="motivation" className="text-base font-semibold group-focus-within:text-primary transition-colors">
                    {t("label")}
                  </Label>
                  <span
                    className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${charCount < 50
                        ? "bg-muted text-muted-foreground"
                        : charCount > 1000
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-500/10 text-green-600"
                      }`}
                  >
                    {t("charCount", { count: charCount })}
                  </span>
                </div>
                <div className="relative">
                  <Textarea
                    id="motivation"
                    placeholder={t("placeholder")}
                    rows={8}
                    className={`resize-none rounded-2xl border-2 p-5 text-base transition-all duration-300 focus:ring-4 focus:ring-primary/10 ${errors.motivation
                        ? "border-destructive focus:border-destructive"
                        : "border-muted-foreground/10 focus:border-primary"
                      } bg-card/50 backdrop-blur-sm`}
                    {...register("motivation")}
                  />
                  <div className="absolute bottom-4 right-4 text-muted-foreground/20 group-focus-within:text-primary/20 pointer-events-none transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                </div>
                {errors.motivation && (
                  <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                    {errors.motivation.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <Button size="lg" variant="ghost" asChild className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group">
              <Link href={prevStepUrl}>
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" /> {tCommon("back")}
              </Link>
            </Button>
            <Button size="lg" asChild disabled={!isValid} className="px-10 rounded-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Link href={isValid ? nextStepUrl : "#"}>
                {tCommon("continue")} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachOnboardingStep3() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CoachOnboardingStep3Content />
    </React.Suspense>
  );
}
