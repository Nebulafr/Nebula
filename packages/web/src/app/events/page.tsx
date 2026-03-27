
"use client";

import { useState } from "react";
import { usePublicEvents } from "@/hooks";
import { useTranslations } from "next-intl";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  PriceFilters,
  SearchBar,
  EventFilters,
  EventSection,
} from "./components";

export default function EventsPage() {
  const t = useTranslations("events");
  const [activePriceFilter, setActivePriceFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: eventsResponse,
    isLoading: loading,
  } = usePublicEvents({
    search: searchTerm || undefined,
    eventType: activeTypeFilter?.toUpperCase() || undefined,
    accessType:
      activePriceFilter === "All" ? undefined : activePriceFilter,
  });
  const events = eventsResponse?.events || [];

  const handleTypeFilterClick = (filterName: string) => {
    setActiveTypeFilter((prevFilter) =>
      prevFilter === filterName ? null : filterName,
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const webinarEvents = events.filter(
    (event: any) => event.eventType === "WEBINAR",
  );
  const socialEvents = events.filter(
    (event: any) => event.eventType === "SOCIAL",
  );

  const showWebinars = !activeTypeFilter || activeTypeFilter === "Webinar";
  const showSocial = !activeTypeFilter || activeTypeFilter === "Social";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container pt-12 pb-8 md:pt-24 md:pb-12 text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
            {t("title")}
          </h1>
          <PriceFilters
            activePriceFilter={activePriceFilter}
            onPriceFilterChange={setActivePriceFilter}
            loading={loading}
          />
        </section>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
        />

        <EventFilters
          activeTypeFilter={activeTypeFilter}
          onTypeFilterClick={handleTypeFilterClick}
          loading={loading}
        />

        {showWebinars && (
          <EventSection title={t("webinar")} events={webinarEvents} />
        )}

        {showSocial && (
          <EventSection title={t("socialExperience")} events={socialEvents} />
        )}
      </main>
      <Footer />
    </div>
  );
}
