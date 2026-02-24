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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingStep4Schema,
  type CoachOnboardingStep4Data,
} from "@/lib/validations";
import { Label } from "@/components/ui/label";

function CoachOnboardingStep4Content() {
  const t = useTranslations("common.onboarding.coach.step4");
  const tCommon = useTranslations("common.onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "coach-hero");

  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const company = searchParams.get("company");
  const linkedin = searchParams.get("linkedin");
  const specialties = searchParams.get("specialties");
  const motivation = searchParams.get("motivation");

  const {
    register,
    formState: { errors, isValid },
    watch,
  } = useForm<CoachOnboardingStep4Data>({
    resolver: zodResolver(coachOnboardingStep4Schema),
    mode: "onChange",
    defaultValues: {
      style: "",
    },
  });

  const style = watch("style");
  const charCount = style.length;

  const nextStepUrl = `/coach-onboarding/step-5?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(
    specialties || ""
  )}&motivation=${encodeURIComponent(
    motivation || ""
  )}&style=${encodeURIComponent(style)}`;

  const prevStepUrl = `/coach-onboarding/step-3?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(
    specialties || ""
  )}&motivation=${encodeURIComponent(motivation || "")}`;

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-5">
      <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block">
        {image && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            quality={85}
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
          <Progress value={80} className="h-2" />
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
            <CardContent className="grid gap-4 p-0 mt-8">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="style">{t("label")}</Label>
                  <span
                    className={`text-xs ${charCount < 50
                        ? "text-muted-foreground"
                        : charCount > 1000
                          ? "text-destructive"
                          : "text-green-600"
                      }`}
                  >
                    {t("charCount", { count: charCount })}
                  </span>
                </div>
                <Textarea
                  id="style"
                  placeholder={t("placeholder")}
                  rows={6}
                  className={errors.style ? "border-destructive" : ""}
                  {...register("style")}
                />
                {errors.style && (
                  <p className="text-sm text-destructive">
                    {errors.style.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button size="lg" variant="outline" asChild>
              <Link href={prevStepUrl}>
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

export default function CoachOnboardingStep4() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CoachOnboardingStep4Content />
    </React.Suspense>
  );
}
