"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { Program } from "@/generated/prisma";
import { useTranslations } from "next-intl";
import { ProgramCard } from "@/components/cards/program-card";

type ProgramWithRelations = Program & {
  category: {
    id: string;
    name: string;
  };
  coach: {
    id: string;
    title?: string;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string;
    };
  };
  attendees: string[];
  _count: {
    enrollments: number;
    reviews: number;
  };
};

interface RecommendedProgramsProps {
  programs: ProgramWithRelations[];
  loading?: boolean;
}

export function RecommendedPrograms({
  programs,
  loading = false,
}: RecommendedProgramsProps) {
  const t = useTranslations("dashboard.student");
  const tc = useTranslations("common");

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">
            {t("browsePrograms")}
          </h3>
          <Button variant="link" disabled>
            {tc("seeAll")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6">
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-80 h-96 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">
          {t("browsePrograms")}
        </h3>
        <Button variant="link" asChild>
          <Link href="/programs">
            {tc("seeAll")} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("noRecommendedPrograms")}
            </p>
            <Button asChild className="mt-4">
              <Link href="/programs">{t("browseAllPrograms")}</Link>
            </Button>
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {programs.map((program) => (
                <CarouselItem
                  key={program.id}
                  className="p-2 md:basis-1/2 lg:basis-1/3"
                >
                  <ProgramCard program={program as any} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-4 flex justify-start gap-2">
              <CarouselPrevious className="relative -left-0 top-0 translate-y-0" />
              <CarouselNext className="relative -right-0 top-0 translate-y-0" />
            </div>
          </Carousel>
        )}
      </div>
    </div>
  );
}
