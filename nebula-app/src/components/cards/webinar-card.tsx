"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useTranslations, useLocale, useFormatter } from "next-intl";
import { Event } from "@/types/event";
import { getEventBackgroundColor, getDefaultAvatar } from "@/lib/event-utils";

interface WebinarCardProps {
  event: Event;
  index: number;
  previousIndex?: number;
}

export function WebinarCard({ event, index, previousIndex }: WebinarCardProps) {
  const t = useTranslations("events.upcoming");
  const locale = useLocale();
  const format = useFormatter();
  const eventDate = new Date(event.date);

  const formatEventDate = (date: Date) => {
    return format.dateTime(date, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (date: Date) => {
    return format.dateTime(date, {
      hour: "numeric",
      minute: "2-digit",
      hour12: locale !== "fr",
      timeZoneName: "short",
    });
  };

  const eventUrl = `/events/webinar/${event.slug}`;
  const backgroundColor = getEventBackgroundColor(index, previousIndex);

  return (
    <Link href={eventUrl}>
      <div className="group flex flex-col gap-[5px] h-full">
        <div
          className={`${backgroundColor} p-4 relative rounded-xl transition-transform group-hover:-translate-y-1 flex flex-col flex-grow`}
        >
          <Badge className="absolute top-4 left-4 bg-white text-gray-800 hover:bg-gray-200 z-10">
            {t(event.accessType === "Free" ? "free" : "premium")}
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
                {event.organizer?.fullName || t("failed")}
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
              {event.attendeesList?.slice(0, 3).map((attendee, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={attendee.avatarUrl} />
                  <AvatarFallback>
                    {attendee.fullName?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              )) ||
                Array.from({ length: Math.min(3, event.attendees) }).map(
                  (_, i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-white">
                      <AvatarFallback>
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ),
                )}
            </div>
            {event.attendees > 0 && (
              <span className="ml-3 text-xs font-medium text-muted-foreground">
                {event.attendees > 3 && `+${event.attendees - 3} `}
                {t("attending", { count: event.attendees })}
              </span>
            )}
          </div>
        </div>
        <div className="bg-white py-4 rounded-xl">
          <Button className="w-2/3 bg-gray-900 text-white hover:bg-gray-800 text-left">
            {t("register")} <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
