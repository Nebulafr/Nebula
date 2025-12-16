import { NextRequest } from "next/server";
import { z } from "zod";
import { EventService } from "../services/event.service";
import { createEventSchema, updateEventSchema } from "@/lib/validations";
import {
  BadRequestException,
  ValidationException,
} from "../utils/http-exception";

class EventController {
  async createEvent(request: NextRequest) {
    const payload = await request.json();

    const { googleAccessToken, ...eventData } = payload;

    const body = createEventSchema.parse(eventData);

    return await EventService.create(request, body, googleAccessToken);
  }

  async getEvents(request: NextRequest) {
    return await EventService.find(request);
  }

  async getEvent(id: string) {
    if (!id) {
      throw new BadRequestException("Event ID is required");
    }
    return await EventService.findById(id);
  }

  async getEventBySlug(slug: string) {
    if (!slug) {
      throw new BadRequestException("Event Slug is required");
    }
    return await EventService.findBySlug(slug);
  }

  async updateEvent(request: NextRequest, id: string) {
    const payload = await request.json();

    if (!id) {
      throw new BadRequestException("Event ID is required");
    }

    const body = updateEventSchema.parse(payload);

    return await EventService.update(request, id, body);
  }

  async deleteEvent(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Event ID is required");
    }
    return await EventService.remove(request, id);
  }
}

export const eventController = new EventController();
