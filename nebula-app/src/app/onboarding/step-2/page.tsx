"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BarChart3, Bot, Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { useSearchParams } from "next/navigation";
import React from "react";
import { ExperienceLevel } from "@/generated/prisma";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentOnboardingStep2Schema,
  type StudentOnboardingStep2Data,
} from "@/lib/validations";

const skillLevelConfig = {
  [ExperienceLevel.BEGINNER]: {
    icon: <Leaf className="h-5 w-5 text-green-500" />,
    titleKey: "beginner.title",
    descriptionKey: "beginner.description",
    color: "bg-green-500/10",
  },
  [ExperienceLevel.INTERMEDIATE]: {
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    titleKey: "intermediate.title",
    descriptionKey: "intermediate.description",
    color: "bg-blue-500/10",
  },
  [ExperienceLevel.ADVANCED]: {
    icon: <Bot className="h-5 w-5 text-purple-500" />,
    titleKey: "advanced.title",
    descriptionKey: "advanced.description",
    color: "bg-purple-500/10",
  },
};

const skillLevels = Object.values(ExperienceLevel).map((level) => ({
  value: level,
  ...skillLevelConfig[level as ExperienceLevel],
}));

function OnboardingStep2Content() {
  const t = useTranslations("common.onboarding.student.step2");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "about-hero");
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const {
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<StudentOnboardingStep2Data>({
    resolver: zodResolver(studentOnboardingStep2Schema),
    mode: "onChange",
    defaultValues: {
      skillLevel: "" as any,
    },
  });

  const selectedLevel = watch("skillLevel");

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-5 bg-background">
      <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block overflow-hidden">
        {image && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            className="object-cover scale-105 transition-transform duration-1000 hover:scale-110"
            data-ai-hint={image.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-5xl font-bold tracking-tight">{t("title")}</h2>
          <p className="mt-4 max-w-lg text-lg text-white/80 leading-relaxed font-light">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

        <div className="mx-auto grid w-full max-w-md gap-8 px-6">
          <div className="space-y-2">
            <Progress value={66} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              <span>Step 1</span>
              <span className="text-primary">Step 2</span>
              <span>Step 3</span>
            </div>
          </div>

          <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("description")} <span className="text-destructive">*</span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            {skillLevels.map((level) => (
              <Card
                key={level.value}
                className={`group cursor-pointer rounded-2xl border-2 p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  selectedLevel === level.value
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                    : "border-transparent bg-card hover:border-primary/20 hover:shadow-md"
                }`}
                onClick={() =>
                  setValue("skillLevel", level.value, { shouldValidate: true })
                }
              >
                <CardContent className="flex items-center gap-5 p-5">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${level.color} shadow-inner backdrop-blur-sm`}
                  >
                    {React.cloneElement(level.icon as React.ReactElement, {
                      className: "h-7 w-7",
                    })}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline text-xl font-bold tracking-tight">
                      {t(level.titleKey as any)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground font-medium">
                      {t(level.descriptionKey as any)}
                    </p>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    selectedLevel === level.value
                      ? "border-primary bg-primary"
                      : "border-muted group-hover:border-primary/50"
                  }`}>
                    {selectedLevel === level.value && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {errors.skillLevel && (
            <p className="text-sm font-medium text-destructive text-center animate-bounce">
              {errors.skillLevel.message}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <Button size="lg" variant="ghost" asChild className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group">
              <Link href="/onboarding/step-1">
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" /> {tCommon("back")}
              </Link>
            </Button>
            <Button size="lg" asChild disabled={!isValid} className="px-8 rounded-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Link
                href={`/onboarding/step-3?categoryId=${encodeURIComponent(
                  categoryId || ""
                )}&skillLevel=${encodeURIComponent(selectedLevel || "")}`}
              >
                {tCommon("continue")} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingStep2() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <OnboardingStep2Content />
    </React.Suspense>
  );
}
