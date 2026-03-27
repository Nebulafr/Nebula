import { Info } from "lucide-react";
import { Event } from "@/types/event";
import { WebinarCard } from "@/components/cards/webinar-card";
import { SocialCard } from "@/components/cards/social-card";

interface EventSectionProps {
  title: string;
  events: Event[];
}

export function EventSection({ title, events }: EventSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="container pb-12">
      <div className="mb-8 flex items-center gap-2">
        <h2 className="font-headline text-2xl font-bold">{title}</h2>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event, index) => (
          event.eventType === "WEBINAR" ? (
            <WebinarCard 
              key={event.id} 
              event={event} 
              index={index}
              previousIndex={index > 0 ? index - 1 : undefined}
            />
          ) : (
            <SocialCard 
              key={event.id} 
              event={event} 
              index={index}
              previousIndex={index > 0 ? index - 1 : undefined}
            />
          )
        ))}
      </div>
    </section>
  );
}