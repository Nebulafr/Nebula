"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Euro, Star } from "lucide-react";
import Link from "next/link";
import { truncateText, getUserAvatar, getInitials } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface ProgramCardData {
  id: string;
  title: string;
  slug?: string;
  description: string;
  price?: number;
  rating?: number | null;
  category: {
    id: string;
    name: string;
  };
  coach?: {
    id: string;
    title?: string;
    user: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  attendees?: string[];
  _count?: {
    enrollments?: number;
    reviews?: number;
  };
}

interface ProgramCardProps {
  program: ProgramCardData;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const t = useTranslations("programs.popular");

  return (
    <Link href={`/programs/${program.slug}`} className="flex">
      <Card className="flex w-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg">
        <CardContent className="flex flex-1 flex-col justify-between p-6">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                {program.category.name}
              </Badge>
              <span className="flex items-center font-semibold text-foreground">
                {program.price === 0 || !program.price ? (
                  t("free")
                ) : (
                  <span className="flex items-center">
                    <Euro className="h-4 w-4" />
                    {program.price}
                  </span>
                )}
              </span>
            </div>
            <h3 className="font-headline mt-4 text-2xl font-semibold leading-tight">
              {truncateText(program.title, 50)}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {truncateText(program.description, 100)}
            </p>
          </div>
          <div className="mt-6">
            {program.coach && (
              <div className="mb-6 rounded-lg border bg-background p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        program.coach.user.avatarUrl ||
                        getUserAvatar(program.coach.user.fullName)
                      }
                    />
                    <AvatarFallback>
                      {getInitials(program.coach.user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-headline font-semibold text-foreground">
                      {program.coach.user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {program.coach.title}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              {program._count?.enrollments && program._count.enrollments > 0 ? (
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {program.attendees?.map((attendee, i) => (
                      <Avatar
                        key={i}
                        className="h-8 w-8 border-2 border-background"
                      >
                        <AvatarImage src={attendee} />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {program._count.enrollments > 3 && (
                    <span className="ml-3 text-sm font-medium text-muted-foreground">
                      +{program._count.enrollments - 3}
                    </span>
                  )}
                </div>
              ) : (
                <div />
              )}
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 px-1 py-0.5 text-[10px]"
              >
                <Star className="h-2 w-2 fill-current text-yellow-500" />
                <span className="font-semibold">{program.rating || 0}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
