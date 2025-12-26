import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Star } from "lucide-react";
import { Event } from "@/types/event";

interface SocialCardProps {
  event: Event;
}

export function SocialCard({ event }: SocialCardProps) {
  const eventDate = new Date(event.date);

  return (
    <Link href={`/events/social/${event.slug}`} className="block">
      <Card className="group flex flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg cursor-pointer">
        <div className="relative">
          {event.images && event.images.length > 0 ? (
            <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Image
                src={event.images[0]}
                alt={event.title}
                width={400}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm font-medium text-blue-800">
                  {event.eventType.toLowerCase()}
                </p>
              </div>
            </div>
          )}
          <Badge className="absolute top-2 left-2 bg-white text-gray-800 hover:bg-gray-200">
            {event.isPublic ? "Free" : "Premium"}
          </Badge>
        </div>
        <CardContent className="flex flex-1 flex-col p-4">
          <h3 className="font-headline text-lg font-semibold leading-tight">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.organizer?.avatarUrl} />
              <AvatarFallback>
                {event.organizer?.fullName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              {event.organizer?.fullName || "Unknown"}, Organizer
            </p>
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-green-400 bg-green-50/50 px-1 py-0.5 text-[10px] text-green-700"
            >
              <Star className="h-2 w-2 fill-current text-green-500" />
              <span className="font-semibold">5.0</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>

          <div className="flex-grow" />

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
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
                  ? // Show placeholder avatars when we have attendee count but no specific attendee data
                    Array.from({ length: Math.min(3, event.attendees) }).map(
                      (_, i) => (
                        <Avatar
                          key={i}
                          className="h-8 w-8 border-2 border-white"
                        >
                          <AvatarFallback>
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      )
                    )
                  : null}
              </div>
              {event.attendees > 0 && (
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  {event.attendees > 3 && `+${event.attendees - 3} `}
                  {event.attendees === 1
                    ? "1 person attending"
                    : `${event.attendees} people attending`}
                </span>
              )}
            </div>
          </div>
          <Button className="mt-4 w-full bg-gray-900 text-white hover:bg-gray-800 pointer-events-none">
            Register now <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}