"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCategories } from "@/contexts/CategoryContext";
import { Loader2 } from "lucide-react";

const categoryIcons: Record<string, string> = {
  "Career Prep": "/custom-images/career-prep.svg",
  "School Admissions": "/custom-images/school.svg",
  Technology: "/custom-images/skills-assessment.svg",
  Design: "/custom-images/career-prep.svg",
  Marketing: "/custom-images/skills-assessment.svg",
};

const categoryColors: Record<string, string> = {
  "Career Prep": "bg-primary/10",
  "School Admissions": "bg-blue-500/10",
  Technology: "bg-green-500/10",
  Design: "bg-purple-500/10",
  Marketing: "bg-orange-500/10",
};

export default function OnboardingStep1() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const { categories, loading } = useCategories();
  const image = PlaceHolderImages.find((img) => img.id === "about-story");

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-4xl font-bold">Step 1: Your Interests</h2>
          <p className="mt-2 max-w-lg">
            Let's start by understanding what you're here to achieve.
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col py-12 lg:col-span-2">
        <div className="mx-auto flex w-full max-w-md flex-col h-full gap-6 px-4">
          <Progress value={33} className="h-2" />
          <div className="text-left">
            <h1 className="font-headline text-4xl font-bold text-primary">
              Welcome to Nebula!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Let&apos;s personalize your experience. To start, which program
              are you interested in?
            </p>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 max-h-96 scroll-smooth">
            <div className="grid grid-cols-1 gap-4 pr-2">
              {categories.map((category: any) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition-all hover:shadow-lg ${
                    selectedProgram === category.name
                      ? "border-primary shadow-lg"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedProgram(category.name)}
                >
                  <CardContent className="flex items-center gap-4 p-0">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                        categoryColors[category.name] || "bg-gray-500/10"
                      }`}
                    >
                      <Image
                        src={
                          categoryIcons[category.name] ||
                          "/custom-images/skills-assessment.svg"
                        }
                        alt={category.name}
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-headline text-lg font-semibold truncate">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        Explore programs in {category.name.toLowerCase()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button size="lg" asChild disabled={!selectedProgram}>
              <Link
                href={`/onboarding/step-2?program=${encodeURIComponent(
                  selectedProgram || ""
                )}`}
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
