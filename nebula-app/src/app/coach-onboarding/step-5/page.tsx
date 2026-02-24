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
import { ArrowLeft, CheckCircle, Euro, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { createCoach } from "@/actions/coaches";
import { useAuth } from "@/hooks/use-auth";
import {
  AvailabilitySettings,
  DayAvailability,
} from "@/components/availability-settings";

function CoachOnboardingStep5Content() {
  const t = useTranslations("common.onboarding.coach.step5");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "benefit-schedule");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<
    Record<string, DayAvailability>
  >({});
  const [rate, setRate] = useState("");

  const role = searchParams.get("role");
  const company = searchParams.get("company");
  const linkedin = searchParams.get("linkedin");
  const specialtiesParam = searchParams.get("specialties");
  const motivation = searchParams.get("motivation");
  const style = searchParams.get("style");

  const prevStepUrl = `/coach-onboarding/step-4?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(
    specialtiesParam || ""
  )}&motivation=${encodeURIComponent(motivation || "")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast.error(t("loginRequired"));
      return;
    }

    setIsLoading(true);

    try {
      const specialties = specialtiesParam ? JSON.parse(specialtiesParam) : [];

      const coachData = {
        fullName: profile.fullName || "",
        email: profile.email as string,
        userId: profile.id,
        title: role || "",
        bio: motivation || "",
        style: style || "",
        specialties: specialties,
        pastCompanies: company ? [company] : [],
        linkedinUrl: linkedin || "",
        availability: JSON.stringify(availability),
        hourlyRate: Number(rate) || 0,
        experience: motivation || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        languages: ["English"],
        qualifications: [],
      };

      const result = await createCoach(coachData);

      if (!result.success) {
        throw new Error(result.message || "Failed to create coach profile");
      }

      await refreshUser();
      setTimeout(() => {
        router.replace("/coach-dashboard");
      }, 100);
    } catch (error) {
      console.error("Error submitting coach application:", error);
      toast.error(t("submitError"));
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="mt-4 max-w-lg text-lg text-white/80 leading-relaxed font-light font-sans">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl opacity-50" />

        <div className="mx-auto grid w-full max-w-md gap-8 px-6">
          <div className="space-y-2">
            <Progress value={100} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span>Basic Info</span>
              <span>Specialties</span>
              <span>Motivation</span>
              <span>Style</span>
              <span className="text-primary font-bold">Final</span>
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
            <form onSubmit={handleSubmit} className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <CardContent className="grid gap-8 p-0">
                <div className="grid gap-3">
                  <Label className="text-base font-semibold text-foreground/80 lowercase first-letter:uppercase">
                    {t("availability")}
                  </Label>
                  <div className="rounded-2xl border-2 border-muted-foreground/10 bg-card/50 backdrop-blur-sm p-2">
                    <AvailabilitySettings
                      showHeader={false}
                      showSaveButton={false}
                      onAvailabilityChange={setAvailability}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid gap-3 group">
                  <Label htmlFor="rate" className="text-base font-semibold group-focus-within:text-primary transition-colors">
                    {t("rate")}
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="rate"
                      type="number"
                      placeholder={t("placeholder")}
                      className="pl-12 h-14 rounded-2xl border-2 border-muted-foreground/10 focus:border-primary bg-card/50 backdrop-blur-sm text-lg transition-all focus:ring-4 focus:ring-primary/10"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex items-center justify-between gap-4 mt-10">
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  disabled={isLoading}
                  className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Link href={prevStepUrl}>
                    <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" /> {tCommon("back")}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  type="submit"
                  disabled={isLoading}
                  className="px-10 rounded-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:grayscale"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    <>
                      {t("submit")}
                      <CheckCircle className="ml-2 h-5 w-5" />
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
    <React.Suspense fallback={<div>Loading...</div>}>
      <CoachOnboardingStep5Content />
    </React.Suspense>
  );
}
