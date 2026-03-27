import { Event } from "@/types/event";
import { WebinarCard } from "./webinar-card";
import { SocialCard } from "./social-card";

interface EventCardProps {
  event: Event;
  index: number;
  previousIndex?: number;
}

export function EventCard({ event, index, previousIndex }: EventCardProps) {
  if (event.eventType === "WEBINAR") {
    return <WebinarCard event={event} index={index} previousIndex={previousIndex} />;
  } else {
    return <SocialCard event={event} index={index} previousIndex={previousIndex} />;
  }
}