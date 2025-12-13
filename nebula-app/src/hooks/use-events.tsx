"use client";

import { useState, useEffect } from "react";
import {
  getEvents,
  getPublicEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/actions/events";
import { Event } from "@/types/event";

export function useEvents(params?: {
  search?: string;
  eventType?: string;
  status?: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const response = await getEvents(params);

      if (response.success && response.data) {
        setEvents(response.data.events);
        setError(null);
      } else {
        setEvents([]);
        setError(response.message || "Failed to fetch events");
      }

      setLoading(false);
    }

    fetchEvents();
  }, [params?.search, params?.eventType, params?.status]);

  const refetch = async () => {
    setLoading(true);
    const response = await getEvents(params);

    if (response.success && response.data) {
      setEvents(response.data.events);
      setError(null);
    } else {
      setEvents([]);
      setError(response.message || "Failed to fetch events");
    }

    setLoading(false);
  };

  const handleCreateEvent = async (data: any) => {
    setActionLoading((prev) => ({ ...prev, create: true }));
    try {
      const response = await createEvent(data);
      if (response.success) {
        await refetch();
        return true;
      }
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const handleUpdateEvent = async (id: string, data: any) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await updateEvent(id, data);
      if (response.success) {
        await refetch();
        return true;
      }
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: true }));
    try {
      const response = await deleteEvent(id);
      if (response.success) {
        await refetch();
        return true;
      }
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  return {
    events,
    loading,
    error,
    refetch,
    actionLoading,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
  };
}

export function usePublicEvents(params?: {
  search?: string;
  eventType?: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const response = await getPublicEvents(params);

      if (response.success && response.data) {
        setEvents(response.data.events);
      }

      setLoading(false);
    }

    fetchEvents();
  }, [params?.search, params?.eventType]);

  return { events, loading };
}
