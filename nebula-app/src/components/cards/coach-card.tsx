"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Euro, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface CoachCardProps {
  coach: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    title: string;
    rating: number;
    specialties: string[];
    studentsCoached: number;
    hourlyRate: number;
  };
}

export function CoachCard({ coach }: CoachCardProps) {
  const t = useTranslations("coaches");

  return (
    <Card className="flex w-full flex-col rounded-xl border transition-all hover:shadow-lg h-full">
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={
                coach.avatarUrl ||
                `https://i.pravatar.cc/150?u=${coach.id}`
              }
              alt={coach.fullName}
            />
            <AvatarFallback>
              {coach.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4">
            <h3 className="font-headline text-lg font-semibold">
              {coach.fullName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{coach.title}</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold">{coach.rating}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {coach.specialties.slice(0, 3).map((specialty: string) => (
              <Badge key={specialty} variant="secondary" className="text-[10px]">
                {specialty}
              </Badge>
            ))}
            {coach.specialties.length > 3 && (
              <Badge variant="secondary" className="text-[10px]">+{coach.specialties.length - 3}</Badge>
            )}
          </div>
        </div>
        <div className="flex-grow" />

        {/* Center Stats Section */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm w-full border-t pt-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{coach.studentsCoached}+</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Euro className="h-4 w-4" />
            <span>{coach.hourlyRate}/hr</span>
          </div>
        </div>

        <Button variant="outline" className="mt-4 w-full rounded-lg">
          {t("viewProfile")}
        </Button>
      </CardContent>
    </Card>
  );
}
