"use client";

import { Loading } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingStep2Schema,
  type CoachOnboardingStep2Data,
} from "@/lib/validations";

import { useCoachOnboarding } from "@/contexts/coach-onboarding-context";

function CoachOnboardingStep2Content() {
  const t = useTranslations("common.onboarding.coach.step2");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "about-hero");
  const { data: categoriesResponse, isLoading: loading } = useCategories();
  const categories = useMemo(() => categoriesResponse?.data?.categories || [], [categoriesResponse]);
  const router = useRouter();
  const { data: onboardingData, updateData } = useCoachOnboarding();

  const {
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<CoachOnboardingStep2Data>({
    resolver: zodResolver(coachOnboardingStep2Schema),
    mode: "onChange",
    defaultValues: {
      specialties: onboardingData.specialties || [],
    },
  });
  const specialties = watch("specialties");

  const removeSpecialty = (specToRemove: string) => {
    setValue(
      "specialties",
      specialties.filter((spec) => spec !== specToRemove),
      { shouldValidate: true }
    );
  };

  if (loading) {
    return <Loading fullPage message={t("loading")} />;
  }

  const addCategoryAsSpecialty = (categoryId: string) => {
    if (!specialties.includes(categoryId)) {
      setValue("specialties", [...specialties, categoryId], {
        shouldValidate: true,
      });
    }
  };

  const handleContinue = () => {
    updateData({ specialties });
    router.push("/coach-onboarding/step-3");
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-5 bg-background overflow-hidden">
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
          <p className="mt-4 max-w-lg text-lg text-white/80 leading-relaxed font-light font-sans">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="h-full lg:col-span-2 relative overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl opacity-50" />

        <div className="min-h-full flex flex-col justify-center py-12 px-6 mx-auto w-full max-w-md gap-8">
          <div className="space-y-2">
            <Progress value={40} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span>{t("stepper.basicInfo")}</span>
              <span className="text-primary font-bold">{t("stepper.specialties")}</span>
              <span>{t("stepper.motivation")}</span>
              <span>{t("stepper.style")}</span>
              <span>{t("stepper.final")}</span>
            </div>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t("heading")}
              </CardTitle>
              <CardDescription className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("subheading")}{" "}
                <span className="text-destructive font-bold text-xl leading-none">*</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-0 mt-10">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("suggested")}</Label>
                  <div 
                    className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200"
                    role="group"
                    aria-label={t("suggested")}
                  >
                    {categories.map((category: any, idx: number) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addCategoryAsSpecialty(category.id)}
                        disabled={specialties.includes(category.id)}
                        className="h-10 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-sm font-semibold animate-in fade-in zoom-in-95 fill-mode-both"
                        style={{ animationDelay: `${idx * 40 + 300}ms` }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {specialties.length > 0 && (
                  <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("selected")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specId, idx) => {
                        const category = categories.find((c: any) => c.id === specId);
                        return (
                          <Badge 
                            key={specId} 
                            variant="secondary"
                            className="h-10 px-4 rounded-xl bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors animate-in zoom-in-95"
                            style={{ animationDelay: `${idx * 40}ms` }}
                          >
                            <span className="font-bold text-sm tracking-tight">{category?.name || specId}</span>
                            <button
                              onClick={() => removeSpecialty(specId)}
                              className="ml-2 rounded-full hover:bg-primary/20 p-1 transition-colors"
                              aria-label={`Remove ${category?.name || specId}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                {errors.specialties && (
                  <p className="text-sm font-medium text-destructive animate-in fade-in">
                    {errors.specialties.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <Button size="lg" variant="ghost" asChild className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group">
              <Link href="/coach-onboarding/step-1">
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" /> {tCommon("back")}
              </Link>
            </Button>
            <Button 
              size="lg" 
              onClick={handleContinue} 
              disabled={!isValid}
              className="px-10 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              {tCommon("continue")} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachOnboardingStep2() {
  return (
    <React.Suspense fallback={<Loading fullPage />}>
      <CoachOnboardingStep2Content />
    </React.Suspense>
  );
}
