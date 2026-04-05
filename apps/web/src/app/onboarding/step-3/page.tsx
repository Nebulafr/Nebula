"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { useRouter } from "next/navigation";

// Assets
import shortIcon from "@/lib/images/custom-images/30min.svg";
import standardIcon from "@/lib/images/custom-images/1hrs.svg";
import longIcon from "@/lib/images/custom-images/2h+.svg";
import React, { useState } from "react";
import { createStudent } from "@/actions/student";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentOnboardingStep3Schema,
  type StudentOnboardingStep3Data,
} from "@/lib/validations";

const availabilityOptions = [
  {
    id: "short",
    icon: (
      <Image
        src={shortIcon}
        alt="30 mins"
        width={28}
        height={28}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    ),
    titleKey: "availability.short.title",
    descriptionKey: "availability.short.description",
    color: "bg-yellow-500/10",
  },
  {
    id: "standard",
    icon: (
      <Image
        src={standardIcon}
        alt="1 hour"
        width={28}
        height={28}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    ),
    titleKey: "availability.standard.title",
    descriptionKey: "availability.standard.description",
    color: "bg-blue-500/10",
  },
  {
    id: "long",
    icon: (
      <Image
        src={longIcon}
        alt="2+ hours"
        width={28}
        height={28}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    ),
    titleKey: "availability.long.title",
    descriptionKey: "availability.long.description",
    color: "bg-purple-500/10",
  },
];

import { useStudentOnboarding } from "@/contexts/student-onboarding-context";

function OnboardingStep3Content() {
  const t = useTranslations("common.onboarding.student.step3");
  const tCommon = useTranslations("common.onboarding.common");
  const [isLoading, setIsLoading] = useState(false);
  const image = PlaceHolderImages.find((img) => img.id === "benefit-schedule");
  const router = useRouter();
  const { profile, refreshUser } = useAuth();
  const { data: onboardingData, updateData, resetData } = useStudentOnboarding();

  const {
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<StudentOnboardingStep3Data>({
    resolver: zodResolver(studentOnboardingStep3Schema),
    mode: "onChange",
    defaultValues: {
      availability: onboardingData.availability || "",
    },
  });

  const selectedAvailability = watch("availability");

  const handleFinish = async () => {
    const { interestedCategoryIds, skillLevel, country, countryIso } = onboardingData;

    if (!profile || !interestedCategoryIds || interestedCategoryIds.length === 0 || !skillLevel || !selectedAvailability) {
      toast.error(t("missingInfo"));
      return;
    }

    setIsLoading(true);

    try {
      const result = await createStudent({
        userId: profile.id,
        email: profile.email as string,
        fullName: profile.fullName as string,
        interestedCategoryIds,
        skillLevel,
        commitment: selectedAvailability,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        country: country || undefined,
        countryIso: countryIso || undefined,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to create student profile");
      }

      resetData();
      await refreshUser();
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    } catch (error: any) {
      console.error("Error creating student profile:", error);
      toast.error(error.message || t("saveError"));
    } finally {
      setIsLoading(false);
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

        <div className="min-h-full flex flex-col justify-center py-12 px-6 mx-auto w-full max-w-md gap-6">
          <div className="space-y-2">
            <Progress value={100} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span>{tCommon("step", { number: 1 })}</span>
              <span>{tCommon("step", { number: 2 })}</span>
              <span className="text-primary font-bold">{tCommon("step", { number: 3 })}</span>
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
            className="grid grid-cols-1 gap-4"
            role="radiogroup"
            aria-label={t("selectAvailability")}
          >
            {availabilityOptions.map((option, idx) => (
              <Card
                key={option.id}
                role="radio"
                aria-checked={selectedAvailability === option.id}
                tabIndex={0}
                aria-label={t(option.titleKey as any)}
                className={`group cursor-pointer rounded-2xl border-2 p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${selectedAvailability === option.id
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-transparent bg-card hover:border-primary/20 hover:shadow-md"
                  }`}
                style={{ animationDelay: `${idx * 100 + 300}ms` }}
                onClick={() =>
                  setValue("availability", option.id, { shouldValidate: true })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setValue("availability", option.id, { shouldValidate: true });
                  }
                }}
              >
                <CardContent className="flex items-center gap-5 p-5">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${option.color} shadow-inner backdrop-blur-sm`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline text-xl font-bold tracking-tight">
                      {t(option.titleKey as any)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground font-medium line-clamp-2 leading-snug">
                      {t(option.descriptionKey as any)}
                    </p>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${selectedAvailability === option.id
                      ? "border-primary bg-primary"
                      : "border-muted group-hover:border-primary/50"
                      }`}
                  >
                    {selectedAvailability === option.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {errors.availability && (
            <p className="text-sm font-medium text-destructive text-center animate-in fade-in">
              {errors.availability.message}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Link href="/onboarding/step-2">
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                {tCommon("back")}
              </Link>
            </Button>
            <Button
              size="lg"
              onClick={handleFinish}
              disabled={!isValid || isLoading}
              className="px-12 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("creatingProfile")}
                </>
              ) : (
                <>
                  {t("finish")}
                  <CheckCircle className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingStep3() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <OnboardingStep3Content />
    </React.Suspense>
  );
}
