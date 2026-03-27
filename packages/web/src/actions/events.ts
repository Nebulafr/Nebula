import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";
import { EventsResponse, EventResponse, CreateEventData, UpdateEventData } from "@/types/event";

export async function createEvent(eventData: CreateEventData) {
  return apiPost("/events", eventData, { throwOnError: true });
}

export async function getEvents(params?: {
  search?: string;
  eventType?: string;
  status?: string;
  accessType?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}): Promise<EventsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.eventType) searchParams.set("eventType", params.eventType);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.accessType) searchParams.set("accessType", params.accessType);
  if (params?.isPublic !== undefined) searchParams.set("isPublic", String(params.isPublic));
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet<EventsResponse["data"]>(`/events${query}`, { requireAuth: false }) as Promise<EventsResponse>;
}

export async function getPublicEvents(params?: {
  search?: string;
  eventType?: string;
  accessType?: string;
  limit?: number;
  offset?: number;
}): Promise<EventsResponse> {
  return getEvents({
    ...params,
    status: "UPCOMING",
  });
}

export async function getEventById(id: string): Promise<EventResponse> {
  return apiGet<EventResponse["data"]>(`/events/${id}`, { requireAuth: false }) as Promise<EventResponse>;
}

export async function getEventBySlug(slug: string): Promise<EventResponse> {
  return apiGet<EventResponse["data"]>(`/events/slug/${slug}`, { requireAuth: false }) as Promise<EventResponse>;
}

export async function updateEvent(id: string, updateData: UpdateEventData) {
  return apiPut(`/events/${id}`, updateData, { throwOnError: true });
}

export async function deleteEvent(id: string) {
  return apiDelete(`/events/${id}`, { throwOnError: true });
}

export async function registerForEvent(eventId: string) {
  return apiPost(`/events/${eventId}/register`, {}, { throwOnError: true });
}

export async function unregisterFromEvent(eventId: string) {
  return apiDelete(`/events/${eventId}/register`, { throwOnError: true });
}
