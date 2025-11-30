"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import { createStudent } from "@/actions/student";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";

const availabilities = [
  {
    icon: <Clock className="h-5 w-5 text-yellow-500" />,
    title: "30 mins / week",
    description: "A quick check-in.",
    color: "bg-yellow-500/10",
  },
  {
    icon: <Clock className="h-5 w-5 text-blue-500" />,
    title: "1 hour / week",
    description: "A standard session.",
    color: "bg-blue-500/10",
  },
  {
    icon: <Zap className="h-5 w-5 text-purple-500" />,
    title: "2+ hours / week",
    description: "Ready to dive deep.",
    color: "bg-purple-500/10",
  },
];

function OnboardingStep3Content() {
  const [selectedAvailability, setSelectedAvailability] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const image = PlaceHolderImages.find((img) => img.id === "benefit-schedule");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, refreshUser } = useAuth();

  const program = searchParams.get("program");
  const skillLevel = searchParams.get("skillLevel");

  const handleFinish = async () => {
    console.log({ profile, program, skillLevel, selectedAvailability });
    if (!profile || !program || !skillLevel || !selectedAvailability) {
      toast.error(
        "Some information is missing. Please go back and complete all steps."
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await createStudent({
        userId: profile.id,
        email: profile.email as string,
        fullName: profile.fullName as string,
        interestedProgram: program,
        skillLevel: skillLevel,
        commitment: selectedAvailability,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to create student profile");
      }

      toast.success("Profile created successfully!");
      await refreshUser();
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    } catch (error: any) {
      console.error("Error creating student profile:", error);
      toast.error(
        error.message || "Could not save your profile. Please try again."
      );
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
          <h2 className="text-4xl font-bold">Step 3: Your Commitment</h2>
          <p className="mt-2 max-w-lg">
            Let us know how much time you can dedicate to your growth.
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-6 px-4">
          <Progress value={100} className="mb-6 h-2" />
          <div className="text-left">
            <h1 className="font-headline text-4xl font-bold text-primary">
              How much time can you commit?
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              This will help us find the perfect time for your coaching
              sessions.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6">
            {availabilities.map((availability) => (
              <Card
                key={availability.title}
                className={`cursor-pointer rounded-xl border p-6 text-left transition-all hover:shadow-lg ${
                  selectedAvailability === availability.title
                    ? "border-primary shadow-lg"
                    : "border-border"
                }`}
                onClick={() => setSelectedAvailability(availability.title)}
              >
                <CardContent className="flex items-center gap-6 p-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${availability.color}`}
                  >
                    {availability.icon}
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-semibold">
                      {availability.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {availability.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button size="lg" variant="outline" asChild>
              <Link
                href={`/onboarding/step-2?program=${encodeURIComponent(
                  program || ""
                )}`}
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Link>
            </Button>
            <Button
              size="lg"
              onClick={handleFinish}
              disabled={!selectedAvailability || isLoading}
            >
              {isLoading ? "Creating Profile..." : "Finish"}
              {!isLoading && <CheckCircle className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingStep3() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <OnboardingStep3Content />
    </React.Suspense>
  );
}
