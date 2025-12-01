"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { UserProfile } from "@/hooks/use-user";

interface Session {
  title: string;
  coach: string;
  date: string;
  day: string;
  time: string;
  type: string;
}

interface UpcomingSessionsProps {
  sessions: Session[];
  user: UserProfile;
  loading?: boolean;
  onRegister?: (session: Session) => void;
}

export function UpcomingSessions({ 
  sessions, 
  user, 
  loading = false, 
  onRegister 
}: UpcomingSessionsProps) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              Upcoming Sessions
            </h3>
          </div>
          <Button variant="link" disabled>
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6 rounded-xl bg-primary/5 p-6">
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-80 h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            Upcoming Sessions
          </h3>
        </div>
        <Button variant="link" asChild>
          <Link href="/events">
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6 rounded-xl bg-primary/5 p-6">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {sessions.map((session, index) => (
              <CarouselItem
                key={index}
                className="p-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card
                  key={session.title}
                  className="group flex h-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg"
                >
                  <CardContent className="relative flex flex-1 flex-col p-6">
                    <Badge
                      variant="outline"
                      className="absolute right-4 top-4 z-10 bg-background/50 backdrop-blur-sm transition-opacity group-hover:opacity-20"
                    >
                      {session.type}
                    </Badge>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="flex w-16 flex-col items-center justify-center rounded-lg border bg-background p-2">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {session.day}
                          </span>
                          <span className="font-headline text-3xl font-bold text-primary">
                            {session.date.split(" ")[1]}
                          </span>
                          <span className="-mt-1 text-xs text-muted-foreground">
                            {session.date.split(" ")[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline text-lg font-semibold leading-tight">
                            {session.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            with {session.coach}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {session.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex-grow" />
                    <Button 
                      className="w-full" 
                      onClick={() => onRegister?.(session)}
                    >
                      Register
                    </Button>
                  </CardContent>
                </Card>
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