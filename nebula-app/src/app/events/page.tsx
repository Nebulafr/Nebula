"use client";

import { useState } from "react";
import { usePublicEvents } from "@/hooks";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Event } from "@/types/event";
import {
  PriceFilters,
  SearchBar,
  EventFilters,
  EventSection,
} from "./components";

export default function EventsPage() {
  const [activePriceFilter, setActivePriceFilter] = useState("All");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: eventsResponse,
    isLoading: loading,
    error,
  } = usePublicEvents({
    search: searchTerm || undefined,
    eventType: activeTypeFilter?.toUpperCase() || undefined,
  });
  const events = eventsResponse?.data?.events || [];

  const handleTypeFilterClick = (filterName: string) => {
    setActiveTypeFilter((prevFilter) =>
      prevFilter === filterName ? null : filterName
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredEvents = events.filter((event: Event) => {
    const priceMatch =
      activePriceFilter === "All" ||
      (activePriceFilter === "Free" && event.accessType === "free") ||
      (activePriceFilter === "Premium" && event.accessType === "premium");
    return priceMatch;
  });

  const webinarEvents = filteredEvents.filter(
    (event: any) => event.eventType === "WEBINAR"
  );
  const socialEvents = filteredEvents.filter(
    (event: any) => event.eventType === "SOCIAL"
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
          <PriceFilters
            activePriceFilter={activePriceFilter}
            onPriceFilterChange={setActivePriceFilter}
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
          <EventSection title="Webinar" events={webinarEvents} />
        )}

        {showSocial && (
          <EventSection title="Social Experience" events={socialEvents} />
        )}
      </main>
      <Footer />
    </div>
  );
}
