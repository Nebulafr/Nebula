"use client";

import { useState, useEffect } from "react";
import { useEventsContext } from "@/contexts/events-context";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ExternalLink,
  Info,
  PartyPopper,
  Search,
  Star,
  Users,
  Video,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Event } from "@/types/event";
import { sampleEvents } from "../../../data/event";

export default function EventsPage() {
  const [activePriceFilter, setActivePriceFilter] = useState("All");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { events, loading, refetch } = useEventsContext();

  useEffect(() => {
    const params = {
      search: searchTerm || undefined,
      eventType: activeTypeFilter?.toUpperCase() || undefined,
    };

    refetch(params);
  }, [searchTerm, activeTypeFilter, refetch]);

  const priceFilters = ["All", "Free", "Premium"];
  const typeFilters = [
    {
      name: "Webinar",
      icon: <Video className="mr-2 h-4 w-4" />,
      tooltip: "Show only webinars. Click again to clear.",
    },
    {
      name: "Social",
      icon: <PartyPopper className="mr-2 h-4 w-4" />,
      tooltip: "Show only social events. Click again to clear.",
    },
    {
      name: "Workshop",
      icon: <Users className="mr-2 h-4 w-4" />,
      tooltip: "Show only workshops. Click again to clear.",
    },
    {
      name: "Networking",
      icon: <Star className="mr-2 h-4 w-4" />,
      tooltip: "Show only networking events. Click again to clear.",
    },
  ];

  const handleTypeFilterClick = (filterName: string) => {
    setActiveTypeFilter((prevFilter) =>
      prevFilter === filterName ? null : filterName
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredEvents = (events.length > 3 ? events : sampleEvents).filter(
    (event) => {
      const priceMatch =
        activePriceFilter === "All" ||
        (activePriceFilter === "Free" && event.isPublic) ||
        (activePriceFilter === "Premium" && !event.isPublic);
      return priceMatch;
    }
  );

  const webinarEvents = filteredEvents.filter(
    (event) => event.eventType === "WEBINAR"
  );
  const socialEvents = filteredEvents.filter(
    (event) => event.eventType === "SOCIAL"
  );

  const showWebinars = !activeTypeFilter || activeTypeFilter === "Webinar";
  const showSocial = !activeTypeFilter || activeTypeFilter === "Social";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container pt-12 pb-8 md:pt-24 md:pb-12 text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
            Events
          </h1>
          <div className="mx-auto mt-8 flex max-w-lg justify-center gap-2">
            {priceFilters.map((filter) => (
              <Button
                key={filter}
                variant="outline"
                className={cn(
                  "rounded-full",
                  activePriceFilter === filter && "bg-muted font-bold"
                )}
                onClick={() => setActivePriceFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </section>

        <section className="container pb-12">
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-3xl items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events by title or coach"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 w-full rounded-full border pl-10 focus-visible:ring-0"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-14 w-14 flex-shrink-0 rounded-full ml-2"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
          <div className="mx-auto mt-4 flex max-w-3xl justify-center gap-4">
            <TooltipProvider>
              {typeFilters.map((filter) => (
                <Tooltip key={filter.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        activeTypeFilter === filter.name && "bg-muted"
                      )}
                      onClick={() => handleTypeFilterClick(filter.name)}
                      disabled={loading && activeTypeFilter === filter.name}
                    >
                      {loading && activeTypeFilter === filter.name ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {filter.name}
                        </>
                      ) : (
                        <>
                          {filter.icon}
                          {filter.name}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{filter.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </section>

        {showWebinars && webinarEvents.length > 0 && (
          <section className="container pb-12">
            <div className="mb-8 flex items-center gap-2">
              <h2 className="font-headline text-2xl font-bold">Webinar</h2>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {webinarEvents.map((event) => (
                <ApiEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {showSocial && socialEvents.length > 0 && (
          <section className="container pb-12">
            <div className="mb-8 flex items-center gap-2">
              <h2 className="font-headline text-2xl font-bold">
                Social Experience
              </h2>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {socialEvents.map((event) => (
                <ApiEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ApiWebinarCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);
  const colorMap = {
    WEBINAR: "bg-yellow-50",
    WORKSHOP: "bg-purple-50",
  };

  const backgroundColor =
    colorMap[event.eventType as keyof typeof colorMap] || "bg-yellow-50";

  return (
    <div className="group flex flex-col gap-[5px] h-full">
      <div
        className={`${backgroundColor} p-4 relative rounded-xl transition-transform group-hover:-translate-y-1 flex flex-col flex-grow`}
      >
        <Badge className="absolute top-4 left-4 bg-white text-gray-800 hover:bg-gray-200 z-10">
          {event.isPublic ? "Free" : "Premium"}
        </Badge>
        <div className="flex items-start gap-4 pt-6 pb-4 flex-grow">
          <div className="flex-shrink-0">
            <div className="w-[120px] h-[120px]">
              {event.organizer?.avatarUrl ? (
                <Image
                  src={event.organizer.avatarUrl}
                  alt={event.organizer.fullName || "Organizer"}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover aspect-square w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl text-gray-500">
                    {event.organizer?.fullName?.charAt(0) || "A"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-600">
              {event.organizer?.fullName || "Unknown"}
            </p>
            <h4 className="font-semibold text-gray-800">{event.title}</h4>
            <div className="text-sm text-gray-600">
              <div>
                <p className="font-bold">
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  {eventDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
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
              {event.attendees === 1
                ? "1 person attending"
                : `${event.attendees} people attending`}
            </span>
          )}
        </div>
      </div>
      <div className="bg-white py-4 rounded-xl">
        <Button className="w-2/3 bg-gray-900 text-white hover:bg-gray-800 text-left">
          Register now <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ApiSocialCard({ event }: { event: Event }) {
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

function ApiEventCard({ event }: { event: Event }) {
  if (event.eventType === "WEBINAR") {
    return <ApiWebinarCard event={event} />;
  } else {
    return <ApiSocialCard event={event} />;
  }
}
