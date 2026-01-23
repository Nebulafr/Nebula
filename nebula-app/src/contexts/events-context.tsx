"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getPublicEvents,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/actions/events";
import { Event } from "@/types/event";
import { handleAndToastError } from "@/lib/error-handler";

interface EventsParams {
  search?: string;
  eventType?: string;
  status?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

interface EventsContextType {
  events: Event[];
  upcomingEvents: Event[];
  webinarEvents: Event[];
  socialEvents: Event[];
  loading: boolean;
  error: string | null;
  actionLoading: Record<string, boolean>;
  refetch: (params?: EventsParams) => Promise<void>;
  fetchEvents: (params?: EventsParams) => Promise<Event[]>;
  fetchAdminEvents: (params?: EventsParams) => Promise<Event[]>;
  createEvent: (data: any) => Promise<boolean>;
  updateEvent: (id: string, data: any) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  const fetchEvents = useCallback(
    async (params?: EventsParams): Promise<Event[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await getPublicEvents(params);

        if (response.success && response.data) {
          const fetchedEvents = response.data.events;
          setEvents(fetchedEvents);
          return fetchedEvents;
        } else {
          setError(response.message || "Failed to fetch events");
          setEvents([]);
          return [];
        }
      } catch (err) {
        handleAndToastError(err, "An error occurred while fetching events");
        setEvents([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAdminEvents = useCallback(
    async (params?: EventsParams): Promise<Event[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await getEvents(params);

        if (response.success && response.data) {
          const fetchedEvents = response.data.events;
          setEvents(fetchedEvents);
          return fetchedEvents;
        } else {
          setError(response.message || "Failed to fetch events");
          setEvents([]);
          return [];
        }
      } catch (err) {
        handleAndToastError(err, "An error occurred while fetching events");
        setEvents([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateEvent = useCallback(
    async (data: any): Promise<boolean> => {
      setActionLoading((prev) => ({ ...prev, create: true }));
      try {
        const response = await createEvent(data);
        if (response.success) {
          await fetchAdminEvents();
          return true;
        } else {
          handleAndToastError(response.error || response.message, "Failed to create event");
        }
        return false;
      } catch (error) {
        handleAndToastError(error, "An error occurred while creating the event");
        return false;
      } finally {
        setActionLoading((prev) => ({ ...prev, create: false }));
      }
    },
    [fetchAdminEvents]
  );

  const handleUpdateEvent = useCallback(
    async (id: string, data: any): Promise<boolean> => {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      try {
        const response = await updateEvent(id, data);
        if (response.success) {
          await fetchAdminEvents();
          return true;
        } else {
          handleAndToastError(response.error || response.message, "Failed to update event");
        }
        return false;
      } catch (error) {
        handleAndToastError(error, "An error occurred while updating the event");
        return false;
      } finally {
        setActionLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [fetchAdminEvents]
  );

  const handleDeleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: true }));
      try {
        const response = await deleteEvent(id);
        if (response.success) {
          await fetchAdminEvents();
          return true;
        } else {
          handleAndToastError(response.error || response.message, "Failed to delete event");
        }
        return false;
      } catch (error) {
        handleAndToastError(error, "An error occurred while deleting the event");
        return false;
      } finally {
        setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: false }));
      }
    },
    [fetchAdminEvents]
  );

  const refetch = useCallback(
    async (params?: EventsParams) => {
      await fetchEvents(params);
    },
    [fetchEvents]
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate > now && event.status === "UPCOMING";
  });

  const webinarEvents = events.filter((event) => event.eventType === "WEBINAR");
  const socialEvents = events.filter((event) => event.eventType === "SOCIAL");

  const contextValue: EventsContextType = {
    events,
    upcomingEvents,
    webinarEvents,
    socialEvents,
    loading,
    error,
    actionLoading,
    refetch,
    fetchEvents,
    fetchAdminEvents,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
  };

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEventsContext must be used within an EventsProvider");
  }
  return context;
}
