import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";

export async function createEvent(eventData: any) {
  return apiPost("/events", eventData);
}

export async function getEvents(params?: {
  search?: string;
  eventType?: string;
  status?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.eventType) searchParams.set("eventType", params.eventType);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.isPublic !== undefined)
    searchParams.set("isPublic", params.isPublic.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet(`/events${query}`, { requireAuth: false });
}

export async function getPublicEvents(params?: {
  search?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}) {
  return getEvents({
    ...params,
    isPublic: true,
    status: "UPCOMING",
  });
}

export async function getEventById(id: string) {
  return apiGet(`/events/${id}`, { requireAuth: false });
}

export async function getEventBySlug(slug: string) {
  return apiGet(`/events/slug/${slug}`, { requireAuth: false });
}

export async function updateEvent(id: string, updateData: any) {
  return apiPut(`/events/${id}`, updateData);
}

export async function deleteEvent(id: string) {
  return apiDelete(`/events/${id}`);
}

export async function registerForEvent(eventId: string) {
  return apiPost(`/events/${eventId}/register`);
}

export async function unregisterFromEvent(eventId: string) {
  return apiDelete(`/events/${eventId}/register`);
}
