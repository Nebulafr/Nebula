import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
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
  sessions: any[];
  loading?: boolean;
  onRegister?: (session: Session) => void;
}

export function UpcomingSessions({
  sessions,
  loading = false,
  onRegister,
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
              <div
                key={i}
                className="w-80 h-48 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
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
          <Card className="border-dashed bg-background">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No Upcoming Sessions
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                You don't have any sessions scheduled yet. Browse upcoming
                events and register to get started.
              </p>
              <Button asChild>
                <Link href="/events">Browse Events</Link>
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
          <CarouselContent className="-ml-2">
            {sessions.map((session, index) => (
              <CarouselItem
                key={index}
                className="p-2 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-2 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="relative flex flex-1 flex-col p-0">
                    <div className="p-6 pb-4">
                      <Badge
                        variant="outline"
                        className="mb-4 bg-primary/10 text-primary border-primary/20"
                      >
                        {session.eventType}
                      </Badge>
                      <div className="flex gap-4">
                        <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-2">
                          <span className="text-xs font-medium uppercase text-muted-foreground">
                            {new Date(session.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                              }
                            )}
                          </span>
                          <span className="font-headline text-3xl font-bold text-primary leading-none">
                            {new Date(session.date).getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-headline text-lg font-semibold leading-tight mb-2 line-clamp-2">
                            {session.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            with {session.organizer.fullName}
                          </p>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            {session.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto border-t bg-muted/30 p-4">
                      <Button
                        className="w-full"
                        onClick={() => onRegister?.(session)}
                      >
                        Register
                      </Button>
                    </div>
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
