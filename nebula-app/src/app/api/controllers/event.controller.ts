import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventService } from "../services/event.service";
import { createEventSchema, updateEventSchema } from "@/lib/validations";

class EventController {
  async createEvent(request: NextRequest) {
    try {
      const payload = await request.json();
      const { googleAccessToken, ...eventData } = payload;
      const body = createEventSchema.parse(eventData);
      return await EventService.create(request, body, googleAccessToken);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Invalid request body", errors: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  }

  async getEvents(request: NextRequest) {
    return await EventService.find(request);
  }

  async getEvent(id: string) {
    return await EventService.findById(id);
  }

  async getEventBySlug(request: NextRequest, slug: string) {
    return await EventService.findBySlug(slug);
  }

  async updateEvent(request: NextRequest, id: string) {
    try {
      const payload = await request.json();
      const body = updateEventSchema.parse(payload);
      return await EventService.update(request, id, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Invalid request body", errors: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  }

  async deleteEvent(request: NextRequest, id: string) {
    return await EventService.remove(request, id);
  }
}

export const eventController = new EventController();
