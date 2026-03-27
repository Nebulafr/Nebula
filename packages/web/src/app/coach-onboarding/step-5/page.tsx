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
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { createCoach } from "@/actions/coaches";
import { useAuth } from "@/hooks/use-auth";
import {
  AvailabilitySettings,
  DayAvailability,
  CoachAvailability,
} from "@/components/availability-settings";

import { useCoachOnboarding } from "@/contexts/coach-onboarding-context";

function CoachOnboardingStep5Content() {
  const t = useTranslations("common.onboarding.coach.step5");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "benefit-schedule");
  const router = useRouter();
  const { profile, refreshUser } = useAuth();
  const { data: onboardingData, updateData, resetData } = useCoachOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const [availability, setAvailability] = useState<CoachAvailability>(() => {
    if (onboardingData.availability) {
      try {
        return JSON.parse(onboardingData.availability);
      } catch (e) {
        console.error("Failed to parse availability from context", e);
      }
    }
    return {
      monday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
      tuesday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
      wednesday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
      thursday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
      friday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
      saturday: { enabled: false, intervals: [] },
      sunday: { enabled: false, intervals: [] },
    };
  });
  const [rate, setRate] = useState(onboardingData.hourlyRate || "");

  const handleAvailabilityChange = React.useCallback((newAvail: CoachAvailability) => {
    setAvailability(newAvail);
    updateData({ availability: JSON.stringify(newAvail) });
  }, [updateData]);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast.error(t("loginRequired"));
      return;
    }

    setIsLoading(true);

    try {
      const coachData = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        fullName: profile.fullName || "",
        email: profile.email as string,
        userId: profile.id,
        title: onboardingData.role || "",
        bio: onboardingData.motivation || "",
        style: onboardingData.style || "",
        specialties: onboardingData.specialties || [],
        pastCompanies: onboardingData.company ? [onboardingData.company] : [],
        linkedinUrl: onboardingData.linkedin || "",
        availability: JSON.stringify(availability),
        hourlyRate: Number(rate) || 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        languages: ["English"],
        qualifications: [],
        country: onboardingData.country || "",
        countryIso: onboardingData.countryIso || "",
      };

      const result = await createCoach(coachData);

      if (!result.success) {
        throw new Error(result.message || "Failed to create coach profile");
      }

      resetData();
      await refreshUser();
      setTimeout(() => {
        router.replace("/coach-dashboard");
      }, 100);
    } catch (error: any) {
      console.error("Error submitting coach application:", error);
      toast.error(error.message || t("submitError"));
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
            {t("description")}
          </p>
        </div>
      </div>
      <div className="h-full lg:col-span-2 relative overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl opacity-50" />

        <div className="min-h-full flex flex-col justify-center py-12 px-6 mx-auto w-full max-w-2xl gap-8">
          <div className="space-y-2">
            <Progress value={100} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span>{t("stepper.basicInfo")}</span>
              <span>{t("stepper.specialties")}</span>
              <span>{t("stepper.motivation")}</span>
              <span>{t("stepper.style")}</span>
              <span className="text-primary font-bold">{t("stepper.final")}</span>
            </div>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t("heading")}
              </CardTitle>
              <CardDescription className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("subheading")}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleFinish} className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <div className="space-y-6">
                {/* Hourly Rate Card */}
                <div className="group">
                  <div className="flex justify-between items-end mb-3">
                    <Label htmlFor="rate" className="text-base font-semibold group-focus-within:text-primary transition-colors">
                      {t("rate")}
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="rate"
                      type="number"
                      min="1"
                      placeholder="0"
                      className="pl-14 pr-32 h-20 text-4xl font-black rounded-2xl border-2 border-muted-foreground/10 focus:border-primary bg-card/50 backdrop-blur-sm transition-all focus:ring-8 focus:ring-primary/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none relative z-0"
                      value={rate}
                      onChange={(e) => {
                        setRate(e.target.value);
                        updateData({ hourlyRate: e.target.value });
                      }}
                      disabled={isLoading}
                      required
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <span className="text-2xl font-bold text-primary group-focus-within:scale-110 transition-transform duration-300">€</span>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <span className="text-xs font-bold text-muted-foreground/60 transition-colors uppercase tracking-widest whitespace-nowrap">
                        / {t("perHour")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Availability Section */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-foreground/80 lowercase first-letter:uppercase">
                    {t("availability")}
                  </Label>
                  <div className="rounded-2xl border-2 border-muted-foreground/10 bg-card/50 backdrop-blur-sm p-2">
                    <AvailabilitySettings
                      showHeader={false}
                      showSaveButton={false}
                      initialAvailability={availability}
                      onAvailabilityChange={handleAvailabilityChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4">
                <Button
                  size="lg"
                  variant="ghost"
                  type="button"
                  asChild
                  disabled={isLoading}
                  className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Link href="/coach-onboarding/step-4">
                    <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    {tCommon("back")}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  type="submit"
                  disabled={isLoading || !rate}
                  className="px-12 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {tCommon("finishing")}
                    </>
                  ) : (
                    <>
                      {tCommon("finish")}
                      <CheckCircle className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CoachOnboardingStep5() {
  return (
    <React.Suspense fallback={<Loading fullPage />}>
      <CoachOnboardingStep5Content />
    </React.Suspense>
  );
}
