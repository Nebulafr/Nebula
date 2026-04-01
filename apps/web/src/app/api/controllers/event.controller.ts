import { NextRequest, NextResponse } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { eventService } from "../services/event.service";
import { createEventSchema, updateEventSchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

class EventController {
  async createEvent(request: NextRequest): Promise<NextResponse> {
    const payload = await request.json();
    const body = createEventSchema.parse(payload);
    const user = (request as unknown as any).user;

    const result = await eventService.create(user.id, user.role, body);
    return sendSuccess(result, "Event created successfully", 201);
  }

  async getEvents(request: NextRequest): Promise<NextResponse> {
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
    const result = await eventService.find(params);
    return sendSuccess(result, "Events fetched successfully");
  }

  async getEvent(id: string): Promise<NextResponse> {
    if (!id) {
      throw new BadRequestException("Event ID is required");
    }
    const result = await eventService.findById(id);
    return sendSuccess(result, "Event fetched successfully");
  }

  async getEventBySlug(slug: string): Promise<NextResponse> {
    if (!slug) {
      throw new BadRequestException("Event Slug is required");
    }
    const result = await eventService.findBySlug(slug);
    return sendSuccess(result, "Event fetched successfully");
  }

  async updateEvent(request: NextRequest, id: string): Promise<NextResponse> {
    const payload = await request.json();

    if (!id) {
      throw new BadRequestException("Event ID is required");
    }

    const body = updateEventSchema.parse(payload);
    const user = (request as unknown as any).user;

    const result = await eventService.update(user.id, user.role, id, body);
    return sendSuccess(result, "Event updated successfully");
  }

  async deleteEvent(request: NextRequest, id: string): Promise<NextResponse> {
    if (!id) {
      throw new BadRequestException("Event ID is required");
    }
    const user = (request as unknown as any).user;
    const result = await eventService.remove(user.id, user.role, id);
    const message = (result as any)?.message || "Event deleted successfully";
    return sendSuccess(result, message);
  }

  async registerForEvent(request: NextRequest, eventId: string): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;
    if (!user) {
      throw new BadRequestException("Authentication required");
    }
    const result = await eventService.registerForEvent(user.id, eventId);
    return sendSuccess(result, "Successfully registered for event", 201);
  }

  async unregisterFromEvent(request: NextRequest, eventId: string): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;
    if (!user) {
      throw new BadRequestException("Authentication required");
    }
    const result = await eventService.unregisterFromEvent(user.id, eventId);
    return sendSuccess(result, "Successfully unregistered from event");
  }
}

export const eventController = new EventController();
