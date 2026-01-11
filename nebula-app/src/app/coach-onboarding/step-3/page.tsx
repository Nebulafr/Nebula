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
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingStep3Schema,
  type CoachOnboardingStep3Data,
} from "@/lib/validations";
import { Label } from "@/components/ui/label";

function CoachOnboardingStep3Content() {
  const image = PlaceHolderImages.find((img) => img.id === "benefit-impact");

  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const company = searchParams.get("company");
  const linkedin = searchParams.get("linkedin");
  const specialties = searchParams.get("specialties");

  const {
    register,
    formState: { errors, isValid },
    watch,
  } = useForm<CoachOnboardingStep3Data>({
    resolver: zodResolver(coachOnboardingStep3Schema),
    mode: "onChange",
    defaultValues: {
      motivation: "",
    },
  });

  const motivation = watch("motivation");
  const charCount = motivation.length;

  const nextStepUrl = `/coach-onboarding/step-4?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(
    specialties || ""
  )}&motivation=${encodeURIComponent(motivation)}`;

  const prevStepUrl = `/coach-onboarding/step-2?role=${encodeURIComponent(
    role || ""
  )}&company=${encodeURIComponent(company || "")}&linkedin=${encodeURIComponent(
    linkedin || ""
  )}&specialties=${encodeURIComponent(specialties || "")}`;

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] lg:grid lg:grid-cols-5">
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
          <h2 className="text-4xl font-bold">Step 3: Your Motivation</h2>
          <p className="mt-2 max-w-lg">
            Help us understand what drives you to help others succeed.
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-8 px-4">
          <Progress value={60} className="h-2" />
          <Card className="border-none shadow-none">
            <CardHeader className="p-0 text-left">
              <CardTitle className="text-3xl font-bold text-primary">
                Your "Why"
              </CardTitle>
              <CardDescription>
                What motivates you to coach and mentor others?{" "}
                <span className="text-destructive">*</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-0 mt-8">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="motivation">Motivation</Label>
                  <span
                    className={`text-xs ${
                      charCount < 50
                        ? "text-muted-foreground"
                        : charCount > 1000
                        ? "text-destructive"
                        : "text-green-600"
                    }`}
                  >
                    {charCount}/1000 characters (min: 50)
                  </span>
                </div>
                <Textarea
                  id="motivation"
                  placeholder="Share a brief summary of why you're passionate about coaching..."
                  rows={6}
                  className={errors.motivation ? "border-destructive" : ""}
                  {...register("motivation")}
                />
                {errors.motivation && (
                  <p className="text-sm text-destructive">
                    {errors.motivation.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button size="lg" variant="outline" asChild>
              <Link href={prevStepUrl}>
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Link>
            </Button>
            <Button size="lg" asChild disabled={!isValid}>
              <Link href={nextStepUrl}>
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachOnboardingStep3() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CoachOnboardingStep3Content />
    </React.Suspense>
  );
}
