"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { useRouter } from "next/navigation";

// Assets
import beginnerIcon from "@/lib/images/custom-images/beginner.svg";
import intermediateIcon from "@/lib/images/custom-images/intermediate.svg";
import advancedIcon from "@/lib/images/custom-images/advanced.svg";
import React from "react";
import { ExperienceLevel } from "@/types/index";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentOnboardingStep2Schema,
  type StudentOnboardingStep2Data,
} from "@/lib/validations";

const skillLevelConfig = {
  [ExperienceLevel.BEGINNER]: {
    icon: (
      <Image
        src={beginnerIcon}
        alt="Beginner"
        width={28}
        height={28}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    ),
    titleKey: "beginner.title",
    descriptionKey: "beginner.description",
    color: "bg-green-500/10",
  },
  [ExperienceLevel.INTERMEDIATE]: {
    icon: (
      <Image
        src={intermediateIcon}
        alt="Intermediate"
        width={28}
        height={28}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    ),
    titleKey: "intermediate.title",
    descriptionKey: "intermediate.description",
    color: "bg-blue-500/10",
  },
  [ExperienceLevel.ADVANCED]: {
    icon: (
      <Image
        src={advancedIcon}
        alt="Advanced"
        width={28}
        height={28}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    ),
    titleKey: "advanced.title",
    descriptionKey: "advanced.description",
    color: "bg-purple-500/10",
  },
};

const skillLevels = Object.values(ExperienceLevel).map((level) => ({
  value: level,
  ...skillLevelConfig[level as ExperienceLevel],
}));

import { useStudentOnboarding } from "@/contexts/student-onboarding-context";

function OnboardingStep2Content() {
  const t = useTranslations("common.onboarding.student.step2");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "about-hero");
  const router = useRouter();
  const { data: onboardingData, updateData } = useStudentOnboarding();

  const {
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<StudentOnboardingStep2Data>({
    resolver: zodResolver(studentOnboardingStep2Schema),
    mode: "onChange",
    defaultValues: {
      skillLevel: onboardingData.skillLevel as any || "",
    },
  });
  const selectedLevel = watch("skillLevel");

  const handleContinue = () => {
    if (selectedLevel) {
      updateData({ skillLevel: selectedLevel });
      router.push("/onboarding/step-3");
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-5 bg-background overflow-hidden">
      <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block overflow-hidden">
        {image && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            quality={85}
            className="object-cover scale-105 transition-transform duration-1000 hover:scale-110"
            data-ai-hint={image.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-5xl font-bold tracking-tight">{t("title")}</h2>
          <p className="mt-4 max-w-lg text-lg text-white/80 leading-relaxed font-light font-sans">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="h-full lg:col-span-2 relative overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl opacity-50" />

        <div className="min-h-full flex flex-col justify-center py-12 px-6 mx-auto w-full max-w-md gap-8">
          <div className="space-y-2">
            <Progress value={66} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span>{tCommon("step", { number: 1 })}</span>
              <span className="text-primary font-bold">{tCommon("step", { number: 2 })}</span>
              <span>{tCommon("step", { number: 3 })}</span>
            </div>
          </div>

          <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t("description")} <span className="text-destructive font-bold text-xl leading-none">*</span>
            </p>
          </div>

          <div 
            className="mt-6 grid grid-cols-1 gap-4"
            role="radiogroup"
            aria-label={t("selectSkillLevel")}
          >
            {skillLevels.map((level, idx) => (
              <Card
                key={level.value}
                role="radio"
                aria-checked={selectedLevel === level.value}
                tabIndex={0}
                aria-label={t(level.titleKey as any)}
                className={`group cursor-pointer rounded-2xl border-2 p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${selectedLevel === level.value
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-transparent bg-card hover:border-primary/20 hover:shadow-md"
                  }`}
                style={{ animationDelay: `${idx * 100 + 300}ms` }}
                onClick={() =>
                  setValue("skillLevel", level.value, { shouldValidate: true })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setValue("skillLevel", level.value, { shouldValidate: true });
                  }
                }}
              >
                <CardContent className="flex items-center gap-5 p-5">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${level.color} shadow-inner backdrop-blur-sm`}
                  >
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline text-xl font-bold tracking-tight">
                      {t(level.titleKey as any)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground font-medium line-clamp-2 leading-snug">
                      {t(level.descriptionKey as any)}
                    </p>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${selectedLevel === level.value
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
            <p className="text-sm font-medium text-destructive text-center animate-in fade-in">
              {errors.skillLevel.message}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <Button size="lg" variant="ghost" asChild className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group">
              <Link href="/onboarding/step-1">
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" /> {tCommon("back")}
              </Link>
            </Button>
            <Button
              size="lg"
              disabled={!isValid}
              onClick={handleContinue}
              className="px-12 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              {tCommon("continue")} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
