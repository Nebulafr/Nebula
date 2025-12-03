import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventService } from "../services/event.service";
import { createEventSchema, updateEventSchema } from "../utils/schemas";

class EventController {
  async createEvent(request: NextRequest) {
    const payload = await request.json();
    const body = createEventSchema.parse(payload);
    return await EventService.create(body);
  }

  async getEvents() {
    return await EventService.find();
  }

  async getEvent(id: string) {
    try {
      const event = await EventService.findById(id);
      if (!event) {
        return NextResponse.json(
          { message: "Event not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(event);
    } catch (error) {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
    }
  }

  async updateEvent(request: NextRequest, id: string) {
    try {
      const payload = await request.json();
      const body = updateEventSchema.parse(payload);
      const event = await EventService.update(id, body);
      return NextResponse.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Invalid request body", errors: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
    }
  }

  async deleteEvent(id: string) {
    try {
      await EventService.remove(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
    }
  }
}

export const eventController = new EventController();
