"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { useCategories } from "@/hooks";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentOnboardingStep1Schema,
  type StudentOnboardingStep1Data,
} from "@/lib/validations";
import { getDefaultCategoryImage } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CountrySelect } from "@/components/ui/country-select";

import { useStudentOnboarding } from "@/contexts/student-onboarding-context";

const categoryColors: Record<string, string> = {
  "Career Prep": "bg-primary/10",
  "School Admissions": "bg-blue-500/10",
  Technology: "bg-green-500/10",
  Design: "bg-purple-500/10",
  Marketing: "bg-orange-500/10",
};

export default function OnboardingStep1() {
  const t = useTranslations("common.onboarding.student.step1");
  const tCommon = useTranslations("common.onboarding.common");
  const { data: categoriesResponse, isLoading: loading } = useCategories();
  const categories = categoriesResponse?.data?.categories || [];
  const router = useRouter();
  const { profile } = useAuth();
  const { data: onboardingData, updateData } = useStudentOnboarding();

  const [country, setCountry] = useState(onboardingData.country || "");
  const [countryIso, setCountryIso] = useState(onboardingData.countryIso || "");
  const [countryError, setCountryError] = useState("");
  const [saving, setSaving] = useState(false);

  const needsCountry = !profile?.country;

  const {
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<StudentOnboardingStep1Data>({
    resolver: zodResolver(studentOnboardingStep1Schema),
    mode: "onChange",
    defaultValues: {
      interestedCategoryId: onboardingData.interestedCategoryId || "",
    },
  });

  // Update country if context changes (e.g. from back button)
  useEffect(() => {
    if (onboardingData.country && !country) {
      setCountry(onboardingData.country);
    }
    if (onboardingData.countryIso && !countryIso) {
      setCountryIso(onboardingData.countryIso);
    }
  }, [onboardingData.country, onboardingData.countryIso, country, countryIso]);

  const selectedCategoryId = watch("interestedCategoryId");
  const image = PlaceHolderImages.find((img) => img.id === "about-story");

  const handleContinue = async () => {
    if (needsCountry && (!country || !countryIso)) {
      setCountryError("Please select your country");
      return;
    }
    setCountryError("");
    setSaving(true);

    try {
      updateData({
        interestedCategoryId: selectedCategoryId,
        country: country,
        countryIso: countryIso,
      });
      router.push(`/onboarding/step-2`);
    } catch {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">{t("categoriesLoading")}</p>
        </div>
      </div>
    );
  }

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
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="h-full lg:col-span-2 relative overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl opacity-50" />

        <div className="min-h-full flex flex-col justify-center py-12 px-6 mx-auto w-full max-w-md gap-8">
          <div className="space-y-2">
            <Progress value={33} className="h-1.5 bg-muted transition-all duration-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">
              <span className="text-primary font-bold">{tCommon("step", { number: 1 })}</span>
              <span>{tCommon("step", { number: 2 })}</span>
              <span>{tCommon("step", { number: 3 })}</span>
            </div>
          </div>

          <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("welcome")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t("description")}{" "}
              <span className="text-destructive font-bold text-xl leading-none">*</span>
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto min-h-0 max-h-[400px] scroll-smooth pr-2 custom-scrollbar space-y-4"
            role="radiogroup"
            aria-label={t("selectCategory")}
          >
            <div className="grid grid-cols-1 gap-4 pb-4">
              {categories.map((category: any, idx: number) => (
                <Card
                  key={category.id}
                  role="radio"
                  aria-checked={selectedCategoryId === category.id}
                  tabIndex={0}
                  aria-label={category.name}
                  className={`group cursor-pointer rounded-2xl border-2 p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${selectedCategoryId === category.id
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                    : "border-transparent bg-card hover:border-primary/20 hover:shadow-md"
                    }`}
                  style={{ animationDelay: `${idx * 50 + 300}ms` }}
                  onClick={() =>
                    setValue("interestedCategoryId", category.id, { shouldValidate: true })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setValue("interestedCategoryId", category.id, { shouldValidate: true });
                    }
                  }}
                >
                  <CardContent className="flex items-center gap-5 p-5">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${categoryColors[category.name] || "bg-gray-500/10"
                        } shadow-inner backdrop-blur-sm`}
                    >
                      <Image
                        src={
                          category.assetUrl ||
                          getDefaultCategoryImage(category.name) ||
                          "/custom-images/skills-assessment.svg"
                        }
                        alt={category.name}
                        width={28}
                        height={28}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-headline text-xl font-bold tracking-tight truncate">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground font-medium line-clamp-2 leading-snug">
                        {t("explore", { category: category.name.toLowerCase() })}
                      </p>
                    </div>
                    <div className={`h-6 w-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${selectedCategoryId === category.id
                      ? "border-primary bg-primary"
                      : "border-muted group-hover:border-primary/50"
                      }`}>
                      {selectedCategoryId === category.id && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {errors.interestedCategoryId && (
            <p className="text-sm font-medium text-destructive text-center animate-in fade-in">
              {errors.interestedCategoryId.message}
            </p>
          )}

          {needsCountry && (
            <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 group">
              <label className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                Where are you based? <span className="text-destructive font-bold">*</span>
              </label>
              <div className="rounded-2xl border-2 border-muted-foreground/10 bg-card/50 backdrop-blur-sm p-1 focus-within:border-primary transition-all">
                <CountrySelect
                  value={country}
                  onChange={(val) => { setCountry(val); setCountryError(""); }}
                  onIsoChange={setCountryIso}
                  disabled={saving}
                  className="h-auto border-none focus:ring-0"
                />
              </div>
              {countryError && (
                <p className="text-sm font-medium text-destructive animate-in fade-in">{countryError}</p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <Button
              size="lg"
              disabled={!isValid || saving}
              onClick={handleContinue}
              className="px-12 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {tCommon("continue")} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
