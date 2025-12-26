import { Event } from "@/types/event";
import { WebinarCard } from "./webinar-card";
import { SocialCard } from "./social-card";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  if (event.eventType === "WEBINAR") {
    return <WebinarCard event={event} />;
  } else {
    return <SocialCard event={event} />;
  }
}