import { apiPost, apiGet, apiPut, apiDelete } from "@/lib/utils";
import { ApiResponse } from "@/types";

export interface EventSession {
  id: string;
  eventId: string;
  date: string;
  time: string;
  price?: number;
  currency?: string;
  spotsLeft?: number;
  isActive: boolean;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: "WEBINAR" | "SOCIAL" | "WORKSHOP" | "NETWORKING";
  date: string;
  location?: string;
  images?: string[];
  slug?: string;
  organizer?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  isPublic: boolean;
  maxAttendees?: number;
  attendees: number;
  attendeesList?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    status: string;
    registeredAt: string;
  }[];
  status: "DRAFT" | "PENDING" | "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
  tags: string[];
  whatToBring?: string;
  additionalInfo?: string;
  sessions?: EventSession[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  eventType: "WEBINAR" | "SOCIAL" | "WORKSHOP" | "NETWORKING";
  date: Date | string;
  location?: string;
  images?: string[];
  isPublic?: boolean;
  maxAttendees?: number;
  status?:
    | "DRAFT"
    | "PENDING"
    | "UPCOMING"
    | "LIVE"
    | "COMPLETED"
    | "CANCELLED";
  tags?: string[];
  whatToBring?: string;
  additionalInfo?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export async function createEvent(
  eventData: CreateEventData
): Promise<ApiResponse<{ event: Event }>> {
  try {
    const response = await apiPost("/events", eventData);

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error creating event:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to create event",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}

export async function getEvents(params?: {
  search?: string;
  eventType?: string;
  status?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<EventsResponse>> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.set("search", params.search);
    if (params?.eventType) searchParams.set("eventType", params.eventType);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.isPublic !== undefined)
      searchParams.set("isPublic", params.isPublic.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString() ? `?${searchParams}` : "";
    const response = await apiGet(`/events${query}`);

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching events:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      data: {
        events: [],
        pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
      },
      message: errorDetails.message || "Failed to fetch events",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}

export async function getPublicEvents(params?: {
  search?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<EventsResponse>> {
  try {
    return await getEvents({
      ...params,
      isPublic: true,
      status: "UPCOMING",
    });
  } catch (error: any) {
    console.error("Error fetching public events:", error);
    return {
      success: false,
      data: {
        events: [],
        pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
      },
      message: "Failed to fetch public events",
    };
  }
}

export async function getEventById(
  id: string
): Promise<ApiResponse<{ event: Event }>> {
  try {
    const response = await apiGet(`/events/${id}`, { requireAuth: false });

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching event:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to fetch event",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}

export async function updateEvent(
  id: string,
  updateData: UpdateEventData
): Promise<ApiResponse<{ event: Event }>> {
  try {
    const response = await apiPut(`/events/${id}`, updateData);

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating event:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to update event",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}

export async function getEventBySlug(
  slug: string
): Promise<ApiResponse<{ event: Event }>> {
  try {
    const response = await apiGet(`/events/slug/${slug}`, { requireAuth: false });

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching event by slug:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to fetch event",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}

export async function deleteEvent(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await apiDelete(`/events/${id}`);

    return {
      success: true,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error deleting event:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to delete event",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}
