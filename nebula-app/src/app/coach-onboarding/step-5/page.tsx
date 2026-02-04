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
import { ArrowLeft, CheckCircle, Euro } from "lucide-react";
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
    <div className="w-full min-h-screen lg:grid lg:grid-cols-5">
      <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block">
        {image && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            className="object-cover"
            data-ai-hint={image.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-4xl font-bold">{t("title")}</h2>
          <p className="mt-2 max-w-lg">{t("description")}</p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-8 px-4">
          <Progress value={100} className="h-2" />
          <Card className="border-none shadow-none">
            <CardHeader className="p-0 text-left">
              <CardTitle className="text-3xl font-bold text-primary">
                {t("heading")}
              </CardTitle>
              <CardDescription>
                {t("subheading")}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-6 p-0 mt-8">
                <div className="grid gap-3">
                  <Label>{t("availability")}</Label>
                  <AvailabilitySettings
                    showHeader={false}
                    showSaveButton={false}
                    onAvailabilityChange={setAvailability}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate">{t("rate")}</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="rate"
                      type="number"
                      placeholder={t("placeholder")}
                      className="pl-10 h-14"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-between mt-8">
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  disabled={isLoading}
                >
                  <Link href={prevStepUrl}>
                    <ArrowLeft className="mr-2 h-5 w-5" /> {tCommon("back")}
                  </Link>
                </Button>
                <Button size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? t("submitting") : t("submit")}
                  {!isLoading && <CheckCircle className="ml-2 h-5 w-5" />}
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
