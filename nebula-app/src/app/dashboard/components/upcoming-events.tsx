"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Loader2, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Event } from "@/types/event";
import {
  getEventBackgroundColor,
  getDefaultAvatar,
  getAccessTypeText,
} from "@/lib/event-utils";
import { useTranslations, useLocale } from "next-intl";

function EventCard({
  event,
  index,
  previousIndex,
}: {
  event: Event;
  index: number;
  previousIndex?: number;
}) {
  const locale = useLocale();
  const eventDate = new Date(event.date);
  const color = getEventBackgroundColor(index, previousIndex);
  const t = useTranslations("dashboard.student");

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: locale !== "fr",
      timeZoneName: "short",
    });
  };

  const eventUrl =
    event.eventType === "SOCIAL"
      ? `/events/social/${event.slug}`
      : `/events/webinar/${event.slug}`;

  return (
    <div className="group flex flex-col gap-[5px] h-full">
      <div
        className={`${color} p-4 relative rounded-xl transition-transform group-hover:-translate-y-1 flex flex-col flex-grow`}
      >
        <Badge className="absolute top-4 left-4 bg-white text-gray-800 hover:bg-gray-200 z-10">
          {getAccessTypeText(event.accessType)}
        </Badge>
        <div className="flex items-start gap-4 pt-6 pb-4 flex-grow">
          <div className="flex-shrink-0">
            <div className="w-[120px] h-[120px]">
              <Image
                src={
                  event.organizer?.avatarUrl ||
                  getDefaultAvatar(event.organizer?.fullName)
                }
                alt={event.organizer?.fullName || "Organizer"}
                width={120}
                height={120}
                className="rounded-lg object-cover aspect-square w-full h-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-600">
              {event.organizer?.fullName || "Unknown Organizer"}
            </p>
            <h4 className="font-semibold text-gray-800">{event.title}</h4>
            <div className="text-sm text-gray-600">
              <div>
                <p className="font-bold">{formatEventDate(eventDate)}</p>
                <p>{formatEventTime(eventDate)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center pb-2">
          <div className="flex -space-x-2">
            {event.attendeesList && event.attendeesList.length > 0
              ? event.attendeesList.slice(0, 3).map((attendee, i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={attendee.avatarUrl} />
                    <AvatarFallback>
                      {attendee.fullName?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                ))
              : event.attendees > 0
              ? Array.from({ length: Math.min(3, event.attendees) }).map(
                  (_, i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-white">
                      <AvatarFallback>
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  )
                )
              : null}
          </div>
          {event.attendees > 0 && (
            <span className="ml-3 text-xs font-medium text-muted-foreground">
              {useTranslations("events.upcoming")("attending", { count: event.attendees })}
            </span>
          )}
        </div>
      </div>
      <div className="bg-white py-4 rounded-xl">
        <Button
          asChild
          className="w-2/3 bg-gray-900 text-white hover:bg-gray-800 text-left"
        >
          <Link href={eventUrl}>
            {t("registerNow")} <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

interface UpcomingSessionsProps {
  sessions: Event[];
  loading?: boolean;
}



export function UpcomingSessions({
  sessions,
  loading = false,
}: UpcomingSessionsProps) {
  const t = useTranslations("dashboard.student");
  const tc = useTranslations("common");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">{t("upcomingEvents")}</h3>
        <Button variant="link" asChild>
          <Link href="/events">
            {tc("seeAll")} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-[5px] h-full animate-pulse"
              >
                <div className="bg-gray-200 p-4 rounded-xl h-64">
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                </div>
                <div className="bg-gray-200 py-4 rounded-xl h-16"></div>
              </div>
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {sessions.slice(0, 6).map((event: Event, index: number) => (
                <CarouselItem
                  key={event.id}
                  className="p-2 md:basis-1/2 lg:basis-1/3 h-full"
                >
                  <EventCard
                    event={event}
                    index={index}
                    previousIndex={index > 0 ? index - 1 : undefined}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-4 flex justify-start gap-2">
              <CarouselPrevious className="relative -left-0 top-0 translate-y-0" />
              <CarouselNext className="relative -right-0 top-0 translate-y-0" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground my-4">
              {t("noUpcomingEvents")}
            </p>
             <Button asChild>
                  <Link href="/events">{t("browseAllEvents")}</Link>
              </Button>
          </div>
        )}
      </div>
    </div>
  );
}
