
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Euro } from "lucide-react";
import { useTranslations } from "next-intl";

interface LucyCoachCardProps {
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

export function LucyCoachCard({ coach }: LucyCoachCardProps) {
  const t = useTranslations("coaches");

  return (
    <Card className="overflow-hidden border-border/50 bg-background hover:bg-muted/30 transition-colors shadow-none">
      <CardContent className="p-3">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 shrink-0 border border-border/50">
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
          
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate uppercase tracking-tight">
                  {coach.fullName}
                </h4>
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  {coach.title}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-600 shrink-0">
                <Star className="h-3 w-3 fill-yellow-600" />
                <span className="text-[10px] font-bold">{coach.rating}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
               <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold flex items-center gap-0.5">
                    <Euro className="h-3 w-3" />
                    {coach.hourlyRate}/hr
                  </span>
               </div>
               
               <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter hover:bg-primary hover:text-primary-foreground">
                 {t("viewProfile")}
               </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
