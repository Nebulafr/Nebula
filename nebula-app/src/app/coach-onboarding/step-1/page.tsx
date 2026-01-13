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
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingStep1Schema,
  type CoachOnboardingStep1Data,
} from "@/lib/validations";

export default function CoachOnboardingStep1() {
  const image = PlaceHolderImages.find((img) => img.id === "about-story");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CoachOnboardingStep1Data>({
    resolver: zodResolver(coachOnboardingStep1Schema),
    mode: "onChange",
    defaultValues: {
      role: "",
      company: "",
      linkedin: "",
    },
  });

  const formValues = watch();

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
          <h2 className="text-4xl font-bold">
            Step 1: Your Professional Background
          </h2>
          <p className="mt-2 max-w-lg">
            Let's start with your current role and professional presence.
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-8 px-4">
          <Progress value={20} className="h-2" />
          <Card className="border-none shadow-none">
            <CardHeader className="p-0 text-left">
              <CardTitle className="text-3xl font-bold text-primary">
                Your Role & Profile
              </CardTitle>
              <CardDescription>
                What's your current professional role? Please share your
                LinkedIn profile as well.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-0 mt-6">
              <div className="grid gap-2">
                <Label htmlFor="role">
                  Current Role <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="role"
                  placeholder="e.g., Senior Product Manager"
                  className={`h-14 ${errors.role ? "border-destructive" : ""}`}
                  {...register("role")}
                />
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="e.g., Google"
                  className={`h-14 ${errors.company ? "border-destructive" : ""}`}
                  {...register("company")}
                />
                {errors.company && (
                  <p className="text-sm text-destructive">
                    {errors.company.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkedin">
                  LinkedIn Profile URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/your-profile"
                    className={`pl-10 h-14 ${
                      errors.linkedin ? "border-destructive" : ""
                    }`}
                    {...register("linkedin")}
                  />
                </div>
                {errors.linkedin && (
                  <p className="text-sm text-destructive">
                    {errors.linkedin.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button size="lg" asChild disabled={!isValid}>
              <Link
                href={`/coach-onboarding/step-2?role=${encodeURIComponent(
                  formValues.role
                )}&company=${encodeURIComponent(
                  formValues.company
                )}&linkedin=${encodeURIComponent(formValues.linkedin)}`}
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
