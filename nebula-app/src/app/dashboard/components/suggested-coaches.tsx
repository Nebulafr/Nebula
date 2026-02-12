"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Star, Users, UserCheck } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { UserProfile } from "@/hooks/use-user";
import { CoachWithRelations } from "@/types/coach";
import { useTranslations } from "next-intl";
import { CoachCard } from "@/components/cards/coach-card";

interface SuggestedCoachesProps {
  coaches: CoachWithRelations[];
  user: UserProfile;
  loading?: boolean;
}

export function SuggestedCoaches({
  coaches,
  user,
  loading = false,
}: SuggestedCoachesProps) {
  const t = useTranslations("dashboard.student");
  const tc = useTranslations("common");

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">
            {t("suggestedCoaches")}
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
                className="w-80 h-80 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!coaches || coaches.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">
            {t("suggestedCoaches")}
          </h3>
          <Button variant="link" asChild>
            <Link href="/coaches">
              {tc("seeAll")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("noCoachSuggestions")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                {t("findingPerfectCoaches")}
              </p>
              <Button asChild>
                <Link href="/coaches">
                  {t("browseAllCoaches", { coaches: tc("coaches") })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">
          {t("suggestedCoaches")}
        </h3>
        <Button variant="link" asChild>
          <Link href="/coaches">
            {tc("seeAll")} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {coaches.slice(0, 3).map((coach) => (
              <CarouselItem
                key={coach.id}
                className="p-2 md:basis-1/2 lg:basis-1/3 h-full"
              >
                <Link href={`/coaches/${coach.id}`} className="flex h-full">
                  <CoachCard coach={coach} />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-4 flex justify-start gap-2">
            <CarouselPrevious className="relative -left-0 top-0 translate-y-0" />
            <CarouselNext className="relative -right-0 top-0 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}
