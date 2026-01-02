"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Loader2 } from "lucide-react";
import { usePublicEvents } from "@/hooks";
import { Event } from "@/types/event";
import { getEventBackgroundColor, getDefaultAvatar, getAccessTypeText } from "@/lib/event-utils";

function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);
  const color = getEventBackgroundColor(event.id, event.title);

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
                src={event.organizer?.avatarUrl || getDefaultAvatar(event.organizer?.fullName)}
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
              {event.attendees > 3 && `+${event.attendees - 3} `}
              {event.attendees === 1 ? "person" : "people"} attending
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
            Register now <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function UpcomingEventsSection() {
  const {
    data: eventsResponse,
    isLoading: loading,
    error,
  } = usePublicEvents({ limit: 3 });

  const allEvents = eventsResponse?.data?.events || [];
  const upcomingEvents = allEvents.filter((event: Event) => {
    // const eventDate = new Date(event.date);
    // const now = new Date();
    return event.status === "UPCOMING";
  });

  const events = upcomingEvents;

  if (error) {
    return (
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="text-left">
            <h2 className="font-headline">Upcoming Events</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Join live sessions with industry experts to level up your skills.
            </p>
          </div>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">Failed to load events</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="text-left">
          <h2 className="font-headline">Upcoming Events</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Join live sessions with industry experts to level up your skills.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-[5px] h-full animate-pulse"
              >
                <div className="bg-gray-200 p-4 rounded-xl h-64">
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                </div>
                <div className="bg-gray-200 py-4 rounded-xl h-16"></div>
              </div>
            ))
          ) : events.length > 0 ? (
            events
              .slice(0, 3)
              .map((event: Event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="col-span-full text-center">
              <p className="text-muted-foreground">
                No upcoming events at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
