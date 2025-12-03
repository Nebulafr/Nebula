import { NextRequest } from "next/server";
import { CreateEventData, UpdateEventData } from "../utils/schemas";
import { prisma } from "@/lib/prisma";

export class EventService {
  static create = async (data: CreateEventData) => {
    try {
      const event = await prisma.event.create({
        data,
      });
      return event;
    } catch (error) {
      throw error;
    }
  };

  static find = async () => {
    try {
      const events = await prisma.event.findMany();
      return events;
    } catch (error) {
      throw error;
    }
  };

  static findById = async (id: string) => {
    try {
      const event = await prisma.event.findUnique({
        where: {
          id,
        },
      });
      return event;
    } catch (error) {
      throw error;
    }
  };

  static update = async (id: string, data: UpdateEventData) => {
    try {
      const event = await prisma.event.update({
        where: {
          id,
        },
        data,
      });
      return event;
    } catch (error) {
      throw error;
    }
  };

  static remove = async (id: string) => {
    try {
      await prisma.event.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  };
}
