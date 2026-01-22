"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { Program } from "@/generated/prisma";

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
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Browse Programs</h3>
          <Button variant="link" disabled>
            See All <ArrowRight className="ml-2 h-4 w-4" />
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
        <h3 className="text-xl font-bold tracking-tight">Browse Programs</h3>
        <Button variant="link" asChild>
          <Link href="/programs">
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No recommended programs available at the moment.
            </p>
            <Button asChild className="mt-4">
              <Link href="/programs">Browse all programs</Link>
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
                  <Link
                    href={`/programs/${program.slug}`}
                    className="flex h-full"
                  >
                    <Card className="flex h-full w-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg">
                      <CardContent className="flex flex-1 flex-col justify-between p-6">
                        <div className="flex-1">
                          <Badge
                            variant="secondary"
                            className="bg-muted text-muted-foreground"
                          >
                            {program.category.name}
                          </Badge>
                          <h3 className="font-headline mt-4 text-2xl font-semibold leading-tight line-clamp-2">
                            {program.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {program.description}
                          </p>
                        </div>
                        <div className="mt-6">
                          <div className="mb-6 rounded-lg border bg-background p-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={program.coach?.user?.avatarUrl}
                                />
                                <AvatarFallback>
                                  {program.coach?.user?.fullName?.charAt(0) ||
                                    "C"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-headline font-semibold text-foreground">
                                  {program.coach?.user?.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {program.coach?.title}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex -space-x-2">
                                {program.attendees?.map(
                                  (attendee: string, i: number) => (
                                    <Avatar
                                      key={i}
                                      className="h-8 w-8 border-2 border-background"
                                    >
                                      <AvatarImage src={attendee} />
                                      <AvatarFallback>A</AvatarFallback>
                                    </Avatar>
                                  )
                                )}
                              </div>
                              {program._count?.enrollments > 3 && (
                                <span className="ml-2 text-xs font-medium text-muted-foreground">
                                  +{program._count.enrollments - 3}
                                </span>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 px-2 py-0.5 text-[10px]"
                            >
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span className="font-semibold">
                                {program.rating}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
