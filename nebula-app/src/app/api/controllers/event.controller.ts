import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { eventService } from "../services/event.service";
import { createEventSchema, updateEventSchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";

class EventController {
  async createEvent(request: NextRequest) {
    const payload = await request.json();
    const body = createEventSchema.parse(payload);
    const user = (request as unknown as any).user;

    return await eventService.create(user.id, user.role, body);
  }

  async getEvents(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const params = {
      search: searchParams.get("search") || undefined,
      eventType: searchParams.get("eventType") || undefined,
      status: searchParams.get("status") || undefined,
      accessType: searchParams.get("accessType") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      isPublic: searchParams.get("isPublic") === "true" ? true : searchParams.get("isPublic") === "false" ? false : undefined,
    };
    return await eventService.find(params);
  }

  async getEvent(id: string) {
    if (!id) {
      throw new BadRequestException("Event ID is required");
    }
    return await eventService.findById(id);
  }

  async getEventBySlug(slug: string) {
    if (!slug) {
      throw new BadRequestException("Event Slug is required");
    }
    return await eventService.findBySlug(slug);
  }

  async updateEvent(request: NextRequest, id: string) {
    const payload = await request.json();

    if (!id) {
      throw new BadRequestException("Event ID is required");
    }

    const body = updateEventSchema.parse(payload);
    const user = (request as unknown as any).user;

    return await eventService.update(user.id, user.role, id, body);
  }

  async deleteEvent(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Event ID is required");
    }
    const user = (request as unknown as any).user;
    return await eventService.remove(user.id, user.role, id);
  }

  async registerForEvent(request: NextRequest, eventId: string) {
    const user = (request as unknown as AuthenticatedRequest).user;
    if (!user) {
      throw new BadRequestException("Authentication required");
    }
    return await eventService.registerForEvent(user.id, eventId);
  }

  async unregisterFromEvent(request: NextRequest, eventId: string) {
    const user = (request as unknown as AuthenticatedRequest).user;
    if (!user) {
      throw new BadRequestException("Authentication required");
    }
    return await eventService.unregisterFromEvent(user.id, eventId);
  }
}

export const eventController = new EventController();
