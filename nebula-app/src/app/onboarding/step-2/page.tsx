"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BarChart3, Bot, Leaf } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useSearchParams } from "next/navigation";
import React from "react";
import { SkillLevel } from "@/generated/prisma";

const skillLevelConfig = {
  [SkillLevel.BEGINNER]: {
    icon: <Leaf className="h-5 w-5 text-green-500" />,
    title: "Beginner",
    description: "Just starting out, 0-2 years of experience.",
    color: "bg-green-500/10",
  },
  [SkillLevel.INTERMEDIATE]: {
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    title: "Intermediate",
    description: "Have some experience, 2-5 years.",
    color: "bg-blue-500/10",
  },
  [SkillLevel.ADVANCED]: {
    icon: <Bot className="h-5 w-5 text-purple-500" />,
    title: "Advanced",
    description: "Expert in the field, 5+ years of experience.",
    color: "bg-purple-500/10",
  },
};

const skillLevels = Object.values(SkillLevel).map((level) => ({
  value: level,
  ...skillLevelConfig[level],
}));

function OnboardingStep2Content() {
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const image = PlaceHolderImages.find((img) => img.id === "about-hero");
  const searchParams = useSearchParams();
  const program = searchParams.get("program");

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
          <h2 className="text-4xl font-bold">Step 2: Your Skill Level</h2>
          <p className="mt-2 max-w-lg">
            This helps us tailor your experience to the right level.
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-6 px-4">
          <Progress value={66} className="mb-6 h-2" />
          <div className="text-left">
            <h1 className="font-headline text-4xl font-bold text-primary">
              What is your skill level?
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              This will help us match you with the right coaches and content.
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
                onClick={() => setSelectedLevel(level.value)}
              >
                <CardContent className="flex items-center gap-6 p-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${level.color}`}
                  >
                    {level.icon}
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-semibold">
                      {level.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {level.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button size="lg" variant="outline" asChild>
              <Link href="/onboarding/step-1">
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Link>
            </Button>
            <Button size="lg" asChild disabled={!selectedLevel}>
              <Link
                href={`/onboarding/step-3?program=${encodeURIComponent(
                  program || ""
                )}&skillLevel=${encodeURIComponent(selectedLevel || "")}`}
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

export default function OnboardingStep2() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <OnboardingStep2Content />
    </React.Suspense>
  );
}
