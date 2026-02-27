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
    coach?: {
      rating: number;
      totalReviews: number;
    };
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
  lumaEventLink: string;
  accessType?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface INewEvent {
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  organizerId: string;
  location: string;
  images: string[];
  whatToBring: string;
  additionalInfo: string;
  isPublic: boolean;
  maxAttendees: string;
  tags: string[];
  lumaEventLink: string;
  accessType: "Free" | "Premium";
  price: number;
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
}

export type UpdateEventData = Partial<CreateEventData>;

export interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination?: {
      total?: number;
      limit?: number;
      offset?: number;
      hasMore?: boolean;
    };
  };
  error?: string;
  message?: string;
}

export interface EventResponse {
  success: boolean;
  data: {
    event: Event;
  };
  error?: string;
  message?: string;
}
