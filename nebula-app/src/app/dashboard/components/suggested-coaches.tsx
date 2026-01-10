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
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Browse Coaches</h3>
          <Button variant="link" disabled>
            See All <ArrowRight className="ml-2 h-4 w-4" />
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
          <h3 className="text-xl font-bold tracking-tight">Browse Coaches</h3>
          <Button variant="link" asChild>
            <Link href="/coaches">
              See All <ArrowRight className="ml-2 h-4 w-4" />
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
                No Coach Suggestions Yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                We&apos;re finding the perfect coaches for you based on your
                interests. Explore all coaches to find your match.
              </p>
              <Button asChild>
                <Link href="/coaches">Browse All Coaches</Link>
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
        <h3 className="text-xl font-bold tracking-tight">Browse Coaches</h3>
        <Button variant="link" asChild>
          <Link href="/coaches">
            See All <ArrowRight className="ml-2 h-4 w-4" />
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
                className="p-2 md:basis-1/2 lg:basis-1/3"
              >
                <Link href={`/coaches/${coach.slug}`} className="flex h-full">
                  <Card className="flex flex-col w-full rounded-xl border transition-all hover:shadow-lg">
                    <CardContent className="flex flex-1 flex-col p-4">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={
                              coach.avatarUrl ||
                              `https://i.pravatar.cc/96?u=${coach.fullName}`
                            }
                            alt={coach.fullName}
                          />
                          <AvatarFallback>
                            {coach.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="mt-4">
                          <h3 className="font-headline text-lg font-semibold">
                            {coach.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {coach.title}
                          </p>
                          <div className="mt-2 flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold">
                              {coach.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          {coach.specialties?.slice(0, 2).map((specialty) => (
                            <Badge key={specialty} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex-grow" />
                      <div className="mt-4 flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {coach.studentsCoached}+ students
                        </span>
                      </div>
                      <Button variant="outline" className="mt-4 w-full">
                        View Profile
                      </Button>
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
      </div>
    </div>
  );
}
