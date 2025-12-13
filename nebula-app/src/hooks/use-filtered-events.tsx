"use client";

import { useState, useEffect } from "react";
import { useEventsContext } from "@/contexts/events-context";
import { Event } from "@/types/event";

interface FilterParams {
  search?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}

interface UseFilteredEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: (params?: FilterParams) => Promise<void>;
}

export function useFilteredEvents(
  initialParams?: FilterParams
): UseFilteredEventsResult {
  const { fetchEvents, loading, error } = useEventsContext();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const refetchFiltered = async (params?: FilterParams) => {
    const events = await fetchEvents(params || initialParams);
    setFilteredEvents(events);
  };

  useEffect(() => {
    if (initialParams) {
      refetchFiltered(initialParams);
    }
  }, []);

  return {
    events: filteredEvents,
    loading,
    error,
    refetch: refetchFiltered,
  };
}
