"use client";

import { Loader2 } from "lucide-react";
import { usePublicEvents } from "@/hooks";
import { Event } from "@/types/event";
import { useTranslations } from "next-intl";
import { WebinarCard } from "@/components/cards/webinar-card";



export function UpcomingEventsSection() {
  const t = useTranslations("events.upcoming");
  const {
    data: eventsResponse,
    isLoading: loading,
    error,
  } = usePublicEvents({ limit: 3, eventType: "WEBINAR", status: "UPCOMING" });

  const events = eventsResponse?.events || [];


  if (error) {
    return (
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="text-left">
            <h2 className="font-headline">{t("title")}</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">{t("failed")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="text-left">
          <h2 className="font-headline">{t("title")}</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
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
              .map((event: Event, index: number) => (
                <WebinarCard
                  key={event.id}
                  event={event}
                  index={index}
                  previousIndex={index > 0 ? index - 1 : undefined}
                />
              ))
          ) : (
            <div className="col-span-full text-center">
              <p className="text-muted-foreground">
                {t("empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
