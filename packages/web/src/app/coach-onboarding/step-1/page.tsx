"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { ArrowRight, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingStep1Schema,
  type CoachOnboardingStep1Data,
} from "@/lib/validations";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CountrySelect } from "@/components/ui/country-select";

import { useCoachOnboarding } from "@/contexts/coach-onboarding-context";

export default function CoachOnboardingStep1() {
  const t = useTranslations("common.onboarding.coach.step1");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "about-story");
  const router = useRouter();
  const { profile } = useAuth();
  const { data: onboardingData, updateData } = useCoachOnboarding();

  const [country, setCountry] = useState(onboardingData.country || "");
  const [countryIso, setCountryIso] = useState(onboardingData.countryIso || "");
  const [countryError, setCountryError] = useState("");
  const [saving, setSaving] = useState(false);

  const needsCountry = !profile?.country;

  const {
    register,
    formState: { errors, isValid },
    watch,
  } = useForm<CoachOnboardingStep1Data>({
    resolver: zodResolver(coachOnboardingStep1Schema),
    mode: "onChange",
    defaultValues: {
      role: onboardingData.role || "",
      company: onboardingData.company || "",
      linkedin: onboardingData.linkedin || "",
    },
  });
  const formValues = watch();

  // Update country if context changes (e.g. from back button)
  useEffect(() => {
    if (onboardingData.country && !country) {
      setCountry(onboardingData.country);
    }
    if (onboardingData.countryIso && !countryIso) {
      setCountryIso(onboardingData.countryIso);
    }
  }, [onboardingData.country, onboardingData.countryIso, country, countryIso]);

  const handleContinue = async () => {
    if (needsCountry && (!country || !countryIso)) {
      setCountryError("Please select your country");
      return;
    }
    setCountryError("");
    setSaving(true);

    try {
      updateData({
        role: formValues.role,
        company: formValues.company,
        linkedin: formValues.linkedin,
        country: country,
        countryIso: countryIso,
      });
      router.push("/coach-onboarding/step-2");
    } catch {
      setSaving(false);
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
            <Progress value={20} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span className="text-primary font-bold">{t("stepper.basicInfo")}</span>
              <span>{t("stepper.specialties")}</span>
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
                {t("subheading")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-0 mt-10">
              <div className="space-y-6">
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 group">
                  <Label htmlFor="role" className="text-base font-semibold group-focus-within:text-primary transition-colors">
                    {t("roleLabel")}
                  </Label>
                  <Input
                    id="role"
                    {...register("role")}
                    placeholder={t("rolePlaceholder")}
                    className="h-14 rounded-2xl border-2 border-muted-foreground/10 focus:border-primary bg-card/50 backdrop-blur-sm transition-all text-base focus:ring-8 focus:ring-primary/5"
                  />
                  {errors.role && (
                    <p className="text-sm text-destructive font-medium animate-in fade-in">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 group">
                  <Label htmlFor="company" className="text-base font-semibold group-focus-within:text-primary transition-colors">
                    {t("companyLabel")}
                  </Label>
                  <Input
                    id="company"
                    {...register("company")}
                    placeholder={t("companyPlaceholder")}
                    className="h-14 rounded-2xl border-2 border-muted-foreground/10 focus:border-primary bg-card/50 backdrop-blur-sm transition-all text-base focus:ring-8 focus:ring-primary/5"
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive font-medium animate-in fade-in">
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 group">
                  <Label htmlFor="linkedin" className="text-base font-semibold group-focus-within:text-primary transition-colors">
                    {t("linkedinLabel")}
                  </Label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="linkedin"
                      {...register("linkedin")}
                      placeholder="https://linkedin.com/in/username"
                      className="pl-12 h-14 rounded-2xl border-2 border-muted-foreground/10 focus:border-primary bg-card/50 backdrop-blur-sm transition-all text-base focus:ring-8 focus:ring-primary/5"
                    />
                  </div>
                  {errors.linkedin && (
                    <p className="text-sm text-destructive font-medium animate-in fade-in">
                      {errors.linkedin.message}
                    </p>
                  )}
                </div>

                {needsCountry && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 group">
                    <Label htmlFor="country" className="text-base font-semibold group-focus-within:text-primary transition-colors">
                      {t("countryLabel")}
                    </Label>
                    <div className="rounded-2xl border-2 border-muted-foreground/10 bg-card/50 backdrop-blur-sm p-1 focus-within:border-primary transition-all">
                      <CountrySelect
                        value={country}
                        onChange={(val) => {
                          setCountry(val);
                          setCountryError("");
                        }}
                        onIsoChange={setCountryIso}
                        disabled={saving}
                        className="h-auto border-none focus:ring-0"
                      />
                    </div>
                    {countryError && (
                      <p className="text-sm text-destructive font-medium animate-in fade-in">
                        {countryError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <Button
              size="lg"
              disabled={!isValid || saving}
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

