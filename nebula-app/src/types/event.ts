export enum EventType {
  WEBINAR = "WEBINAR",
  SOCIAL = "SOCIAL",
}

export enum EventStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING", 
  UPCOMING = "UPCOMING",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type EventTypeString = keyof typeof EventType;

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
  eventType: EventType;
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
  status: EventStatus;
  tags: string[];
  whatToBring?: string;
  additionalInfo?: string;
  sessions?: EventSession[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventSessionData {
  date: string;
  time: string;
  price?: number;
  currency?: string;
  spotsLeft?: number;
  description?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  eventType: EventType;
  date: Date | string;
  location?: string;
  images?: string[];
  isPublic?: boolean;
  maxAttendees?: number;
  status?: EventStatus;
  tags?: string[];
  whatToBring?: string;
  additionalInfo?: string;
  organizerId?: string;
  sessions?: CreateEventSessionData[];
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
