import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Event } from "@/types/event";
import { getEventGradientBackground, getDefaultAvatar, getDefaultBanner, getAccessTypeText } from "@/lib/event-utils";

interface SocialCardProps {
  event: Event;
  index: number;
  previousIndex?: number;
}

export function SocialCard({ event, index, previousIndex }: SocialCardProps) {
  const t = useTranslations("events.upcoming");
  const locale = useLocale();
  const eventDate = new Date(event.date);

  return (
    <Link href={`/events/social/${event.slug}`} className="block">
      <Card className="group flex flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg cursor-pointer">
        <div className="relative">
          <div className={`w-full h-40 ${getEventGradientBackground(index, previousIndex)} flex items-center justify-center`}>
            <Image
              src={event.images && event.images.length > 0 ? event.images[0] : getDefaultBanner(index, previousIndex)}
              alt={event.title}
              width={400}
              height={160}
              className="object-cover w-full h-full"
            />
          </div>
          <Badge className="absolute top-2 left-2 bg-white text-gray-800 hover:bg-gray-200">
            {t(event.accessType?.toLowerCase() === "free" ? "free" : "premium")}
          </Badge>
        </div>
        <CardContent className="flex flex-1 flex-col p-4">
          <h3 className="font-headline text-lg font-semibold leading-tight">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.organizer?.avatarUrl || getDefaultAvatar(event.organizer?.fullName)} />
              <AvatarFallback>
                {event.organizer?.fullName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              {event.organizer?.fullName || t("failed")}
            </p>
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-green-400 bg-green-50/50 px-1 py-0.5 text-[10px] text-green-700"
            >
              <Star className="h-2 w-2 fill-current text-green-500" />
              <span className="font-semibold">5.0</span>
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            <p className="font-bold">
              {eventDate.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

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
                  ? Array.from({ length: Math.min(3, event.attendees) }).map(
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
        </CardContent>
      </Card>
    </Link>
  );
}