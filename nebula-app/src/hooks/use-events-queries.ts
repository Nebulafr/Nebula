import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  getEvents,
  getPublicEvents,
  getEventById,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
} from "@/actions/events";
import { toast } from "react-toastify";

export const EVENTS_QUERY_KEY = "events";
export const PUBLIC_EVENTS_QUERY_KEY = "public-events";
export const EVENT_BY_ID_QUERY_KEY = "event-by-id";
export const EVENT_BY_SLUG_QUERY_KEY = "event-by-slug";

export function useEvents(params?: {
  search?: string;
  eventType?: string;
  status?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, params],
    queryFn: () => getEvents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePublicEvents(params?: {
  search?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [PUBLIC_EVENTS_QUERY_KEY, params],
    queryFn: () => getPublicEvents(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: [EVENT_BY_ID_QUERY_KEY, id],
    queryFn: () => getEventById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useEventBySlug(slug: string) {
  return useQuery({
    queryKey: [EVENT_BY_SLUG_QUERY_KEY, slug],
    queryFn: () => getEventBySlug(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: any) => createEvent(eventData),
    onSuccess: () => {
      // Invalidate events queries
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PUBLIC_EVENTS_QUERY_KEY] });
      toast.success("Event created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event.");
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) =>
      updateEvent(id, updateData),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PUBLIC_EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [EVENT_BY_ID_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: [EVENT_BY_SLUG_QUERY_KEY] });
      toast.success("Event updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event.");
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      // Invalidate all events queries
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PUBLIC_EVENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EVENT_BY_ID_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EVENT_BY_SLUG_QUERY_KEY] });
      toast.success("Event deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event.");
    },
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => registerForEvent(eventId),
    onSuccess: (_, eventId) => {
      // Invalidate specific event to update registration status
      queryClient.invalidateQueries({
        queryKey: [EVENT_BY_ID_QUERY_KEY, eventId],
      });
      queryClient.invalidateQueries({ queryKey: [EVENT_BY_SLUG_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      toast.success("Successfully registered for event!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register for event.");
    },
  });
}

export function useUnregisterFromEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => unregisterFromEvent(eventId),
    onSuccess: (_, eventId) => {
      // Invalidate specific event to update registration status
      queryClient.invalidateQueries({
        queryKey: [EVENT_BY_ID_QUERY_KEY, eventId],
      });
      queryClient.invalidateQueries({ queryKey: [EVENT_BY_SLUG_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      toast.success("Successfully unregistered from event.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unregister from event.");
    },
  });
}
