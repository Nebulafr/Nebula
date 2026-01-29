"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BarChart3, Bot, Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { useSearchParams } from "next/navigation";
import React from "react";
import { SkillLevel } from "@/generated/prisma";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentOnboardingStep2Schema,
  type StudentOnboardingStep2Data,
} from "@/lib/validations";

const skillLevelConfig = {
  [SkillLevel.BEGINNER]: {
    icon: <Leaf className="h-5 w-5 text-green-500" />,
    titleKey: "beginner.title",
    descriptionKey: "beginner.description",
    color: "bg-green-500/10",
  },
  [SkillLevel.INTERMEDIATE]: {
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    titleKey: "intermediate.title",
    descriptionKey: "intermediate.description",
    color: "bg-blue-500/10",
  },
  [SkillLevel.ADVANCED]: {
    icon: <Bot className="h-5 w-5 text-purple-500" />,
    titleKey: "advanced.title",
    descriptionKey: "advanced.description",
    color: "bg-purple-500/10",
  },
};

const skillLevels = Object.values(SkillLevel).map((level) => ({
  value: level,
  ...skillLevelConfig[level],
}));

function OnboardingStep2Content() {
  const t = useTranslations("onboarding.student.step2");
  const tCommon = useTranslations("onboarding.common");
  const image = PlaceHolderImages.find((img) => img.id === "about-hero");
  const searchParams = useSearchParams();
  const program = searchParams.get("program");

  const {
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<StudentOnboardingStep2Data>({
    resolver: zodResolver(studentOnboardingStep2Schema),
    mode: "onChange",
    defaultValues: {
      skillLevel: "" as any,
    },
  });

  const selectedLevel = watch("skillLevel");

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
          <p className="mt-2 max-w-lg">{t("subtitle")}</p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-6 px-4">
          <Progress value={66} className="mb-6 h-2" />
          <div className="text-left">
            <h1 className="font-headline text-4xl font-bold text-primary">
              {t("heading")}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t("description")}{" "}
              <span className="text-destructive">*</span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6">
            {skillLevels.map((level) => (
              <Card
                key={level.value}
                className={`cursor-pointer rounded-xl border p-6 text-left transition-all hover:shadow-lg ${
                  selectedLevel === level.value
                    ? "border-primary shadow-lg"
                    : "border-border"
                }`}
                onClick={() =>
                  setValue("skillLevel", level.value, { shouldValidate: true })
                }
              >
                <CardContent className="flex items-center gap-6 p-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${level.color}`}
                  >
                    {level.icon}
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-semibold">
                      {t(level.titleKey as any)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(level.descriptionKey as any)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {errors.skillLevel && (
            <p className="text-sm text-destructive text-center">
              {errors.skillLevel.message}
            </p>
          )}

          <div className="mt-6 flex justify-between">
            <Button size="lg" variant="outline" asChild>
              <Link href="/onboarding/step-1">
                <ArrowLeft className="mr-2 h-5 w-5" /> {tCommon("back")}
              </Link>
            </Button>
            <Button size="lg" asChild disabled={!isValid}>
              <Link
                href={`/onboarding/step-3?program=${encodeURIComponent(
                  program || ""
                )}&skillLevel=${encodeURIComponent(selectedLevel || "")}`}
              >
                {tCommon("continue")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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
