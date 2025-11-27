"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowLeft, CheckCircle, Euro } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { createCoach } from "@/actions/coach";
import { useAuth } from "@/contexts/AuthContext";

function CoachOnboardingStep5Content() {
  const image = PlaceHolderImages.find((img) => img.id === "benefit-schedule");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState("1-3");
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

    if (!user) {
      toast.error("You must be logged in to submit an application.");
      return;
    }

    setIsLoading(true);

    try {
      const specialties = specialtiesParam ? JSON.parse(specialtiesParam) : [];

      const coachData = {
        email: user.email as string,
        userId: user.id,
        fullName: user.displayName as string,
        title: role || "",
        bio: motivation || "",
        style: style || "",
        specialties: specialties,
        pastCompanies: company ? [company] : [],
        linkedinUrl: linkedin || "",
        availability: availability,
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

      toast.success(
        `We've received your application and will be in touch soon.`
      );
      router.replace("/coach-dashboard");
    } catch (error) {
      console.error("Error submitting coach application:", error);
      toast.error("Could not submit your application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-4xl font-bold">Step 5: Availability & Rates</h2>
          <p className="mt-2 max-w-lg">
            Finally, let's set your availability and compensation expectations.
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-8 px-4">
          <Progress value={100} className="h-2" />
          <Card className="border-none shadow-none">
            <CardHeader className="p-0 text-left">
              <CardTitle className="text-3xl font-bold text-primary">
                Logistics
              </CardTitle>
              <CardDescription>
                What is your availability and desired hourly rate?
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-6 p-0 mt-8">
                <div className="grid gap-3">
                  <Label>Weekly Availability</Label>
                  <RadioGroup
                    value={availability}
                    onValueChange={setAvailability}
                    disabled={isLoading}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="1-3"
                        id="1-3"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="1-3"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        1-3 hours
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="3-5"
                        id="3-5"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="3-5"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        3-5 hours
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="5+"
                        id="5+"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="5+"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        5+ hours
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate">Desired Hourly Rate (EUR)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="rate"
                      type="number"
                      placeholder="e.g., 75"
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
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Link>
                </Button>
                <Button size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Application"}
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
