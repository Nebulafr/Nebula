import { NextRequest } from "next/server";
import { eventService } from "../services/event.service";
import { createEventSchema, updateEventSchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";

class EventController {
  async createEvent(request: NextRequest) {
    const payload = await request.json();
    console.log({ payload });
    const body = createEventSchema.parse(payload);

    return await eventService.create(request, body);
  }

  async getEvents(request: NextRequest) {
    return await eventService.find(request);
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

    return await eventService.update(request, id, body);
  }

  async deleteEvent(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Event ID is required");
    }
    return await eventService.remove(request, id);
  }

  async registerForEvent(request: NextRequest, eventId: string) {
    const user = (request as any).user;
    if (!user) {
      throw new BadRequestException("Authentication required");
    }
    return await eventService.registerForEvent(user.id, eventId);
  }

  async unregisterFromEvent(request: NextRequest, eventId: string) {
    const user = (request as any).user;
    if (!user) {
      throw new BadRequestException("Authentication required");
    }
    return await eventService.unregisterFromEvent(user.id, eventId);
  }
}

export const eventController = new EventController();
