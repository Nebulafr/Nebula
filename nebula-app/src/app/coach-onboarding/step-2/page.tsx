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
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingStep2Schema,
  type CoachOnboardingStep2Data,
} from "@/lib/validations";

function CoachOnboardingStep2Content() {
  const t = useTranslations("common.onboarding.coach.step2");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "about-hero");
  const [inputValue, setInputValue] = useState("");
  const { data: categoriesResponse, isLoading: loading } = useCategories();
  const categories = categoriesResponse?.data?.categories || [];

  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const company = searchParams.get("company");
  const linkedin = searchParams.get("linkedin");

  const {
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<CoachOnboardingStep2Data>({
    resolver: zodResolver(coachOnboardingStep2Schema),
    mode: "onChange",
    defaultValues: {
      specialties: [],
    },
  });

  const specialties = watch("specialties");

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      if (!specialties.includes(inputValue.trim())) {
        setValue("specialties", [...specialties, inputValue.trim()], {
          shouldValidate: true,
        });
      }
      setInputValue("");
    }
  };

  const removeSpecialty = (specToRemove: string) => {
    setValue(
      "specialties",
      specialties.filter((spec) => spec !== specToRemove),
      { shouldValidate: true }
    );
  };

  const addCategoryAsSpecialty = (categoryName: string) => {
    if (!specialties.includes(categoryName)) {
      setValue("specialties", [...specialties, categoryName], {
        shouldValidate: true,
      });
    }
  };

  const nextStepUrl = `/coach-onboarding/step-3?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(JSON.stringify(specialties))}`;

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
          <Progress value={40} className="h-2" />
          <Card className="border-none shadow-none">
            <CardHeader className="p-0 text-left">
              <CardTitle className="text-3xl font-bold text-primary">
                {t("heading")}
              </CardTitle>
              <CardDescription>
                {t("subheading")}{" "}
                <span className="text-destructive">*</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-0 mt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>{t("suggested")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category: any) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addCategoryAsSpecialty(category.name)}
                        disabled={specialties.includes(category.name)}
                        className="h-8 text-xs"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="specialties">{t("custom")}</Label>
                  <Input
                    id="specialties"
                    placeholder={t("placeholder")}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-14"
                  />
                </div>

                {specialties.length > 0 && (
                  <div className="grid gap-2">
                    <Label>{t("selected")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                          <button
                            onClick={() => removeSpecialty(spec)}
                            className="ml-2 rounded-full hover:bg-black/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {errors.specialties && (
                  <p className="text-sm text-destructive">
                    {errors.specialties.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button size="lg" variant="outline" asChild>
              <Link
                href={`/coach-onboarding/step-1?role=${encodeURIComponent(
                  role || ""
                )}&company=${encodeURIComponent(
                  company || ""
                )}&linkedin=${encodeURIComponent(linkedin || "")}`}
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> {tCommon("back")}
              </Link>
            </Button>
            <Button size="lg" asChild disabled={!isValid}>
              <Link href={nextStepUrl}>
                {tCommon("continue")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachOnboardingStep2() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CoachOnboardingStep2Content />
    </React.Suspense>
  );
}
