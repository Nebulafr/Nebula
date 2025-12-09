import { NextRequest } from "next/server";
import {
  CreateEventData,
  createEventSchema,
  UpdateEventData,
} from "../utils/schemas";
import { prisma } from "@/lib/prisma";
import {
  UnauthorizedException,
  NotFoundException,
} from "../utils/http-exception";
import sendResponse from "../utils/send-response";
import { generateSlug } from "@/lib/utils/slug";

export class EventService {
  static create = async (request: NextRequest, data: CreateEventData) => {
    const user = (request as any).user;

    if (user.role !== "ADMIN") {
      throw new UnauthorizedException("Admin access required");
    }

    if (!data.slug) {
      let baseSlug = generateSlug(data.title);
      let finalSlug = baseSlug;
      let counter = 1;

      while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      data.slug = finalSlug;
    }
    const payload = createEventSchema.parse(data);

    const event = await prisma.event.create({
      data: payload as any,
    });

    return sendResponse.success({ event }, "Event created successfully", 201);
  };

  static find = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const status = searchParams.get("status") || undefined;
    const isPublic = searchParams.get("isPublic");
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? parseInt(limitParam) : 20;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    const whereClause: any = {};

    if (eventType) {
      whereClause.eventType = eventType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (isPublic !== null && isPublic !== undefined) {
      whereClause.isPublic = isPublic === "true";
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { organizer: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        orderBy: {
          date: "asc",
        },
        take: limit,
        skip: offset,
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          attendees: {
            where: {
              status: {
                in: ["REGISTERED", "CONFIRMED", "ATTENDED"],
              },
            },
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },

          _count: {
            select: {
              attendees: {
                where: {
                  status: {
                    in: ["REGISTERED", "CONFIRMED", "ATTENDED"],
                  },
                },
              },
            },
          },
        },
      }),
      prisma.event.count({ where: whereClause }),
    ]);

    const transformedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      date: event.date.toISOString(),
      location: event.location,
      images: event.images || [],
      slug: event.slug,
      organizer: event!.organizer
        ? {
            id: event!.organizer.id,
            fullName: event.organizer.fullName,
            avatarUrl: event.organizer.avatarUrl,
          }
        : null,
      isPublic: event.isPublic,
      maxAttendees: event.maxAttendees,
      attendees: event._count!.attendees,
      attendeesList: event!.attendees.map((attendee: any) => ({
        id: attendee.student.user.id,
        fullName: attendee.student.user.fullName,
        avatarUrl: attendee.student.user.avatarUrl,
        status: attendee.status,
        registeredAt: attendee.registeredAt.toISOString(),
      })),
      status: event.status,
      tags: event.tags,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    return sendResponse.success({
      events: transformedEvents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  };

  static findById = async (id: string) => {
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        attendees: {
          where: {
            status: {
              in: ["REGISTERED", "CONFIRMED", "ATTENDED"],
            },
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        sessions: {
          where: {
            isActive: true,
          },
          orderBy: {
            date: "asc",
          },
        },
        _count: {
          select: {
            attendees: {
              where: {
                status: {
                  in: ["REGISTERED", "CONFIRMED", "ATTENDED"],
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      date: event.date.toISOString(),
      location: event.location,
      images: event.images || [],
      slug: event.slug,
      organizer: (event as any).organizer
        ? {
            id: (event as any).organizer.id,
            fullName: (event as any).organizer.fullName,
            avatarUrl: (event as any).organizer.avatarUrl,
          }
        : null,
      isPublic: event.isPublic,
      maxAttendees: event.maxAttendees,
      attendees: (event as any)._count.attendees,
      attendeesList: (event as any).attendees.map((attendee: any) => ({
        id: attendee.student.user.id,
        fullName: attendee.student.user.fullName,
        avatarUrl: attendee.student.user.avatarUrl,
        status: attendee.status,
        registeredAt: attendee.registeredAt.toISOString(),
      })),
      status: event.status,
      tags: event.tags,
      whatToBring: event.whatToBring,
      additionalInfo: event.additionalInfo,
      sessions:
        event.sessions?.map((session: any) => ({
          id: session.id,
          eventId: session.eventId,
          date: session.date.toISOString(),
          time: session.time,
          price: session.price,
          currency: session.currency,
          spotsLeft: session.spotsLeft,
          isActive: session.isActive,
          description: session.description,
        })) || [],
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendResponse.success({ event: transformedEvent });
  };

  static findBySlug = async (slug: string) => {
    const event = await prisma.event.findUnique({
      where: {
        slug,
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        attendees: {
          where: {
            status: {
              in: ["REGISTERED", "CONFIRMED", "ATTENDED"],
            },
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        sessions: {
          where: {
            isActive: true,
          },
          orderBy: {
            date: "asc",
          },
        },
        _count: {
          select: {
            attendees: {
              where: {
                status: {
                  in: ["REGISTERED", "CONFIRMED", "ATTENDED"],
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      date: event.date.toISOString(),
      location: event.location,
      images: event.images || [],
      slug: event.slug,
      organizer: (event as any).organizer
        ? {
            id: (event as any).organizer.id,
            fullName: (event as any).organizer.fullName,
            avatarUrl: (event as any).organizer.avatarUrl,
          }
        : null,
      isPublic: event.isPublic,
      maxAttendees: event.maxAttendees,
      attendees: (event as any)._count.attendees,
      attendeesList: (event as any).attendees.map((attendee: any) => ({
        id: attendee.student.user.id,
        fullName: attendee.student.user.fullName,
        avatarUrl: attendee.student.user.avatarUrl,
        status: attendee.status,
        registeredAt: attendee.registeredAt.toISOString(),
      })),
      status: event.status,
      tags: event.tags,
      whatToBring: event.whatToBring,
      additionalInfo: event.additionalInfo,
      sessions:
        event.sessions?.map((session: any) => ({
          id: session.id,
          eventId: session.eventId,
          date: session.date.toISOString(),
          time: session.time,
          price: session.price,
          currency: session.currency,
          spotsLeft: session.spotsLeft,
          isActive: session.isActive,
          description: session.description,
        })) || [],
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendResponse.success({ event: transformedEvent });
  };

  static update = async (
    request: NextRequest,
    id: string,
    data: UpdateEventData
  ) => {
    const user = (request as any).user;

    if (user.role !== "ADMIN") {
      throw new UnauthorizedException("Admin access required");
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException("Event not found");
    }

    const event = await prisma.event.update({
      where: {
        id,
      },
      data,
    });

    return sendResponse.success({ event }, "Event updated successfully");
  };

  static remove = async (request: NextRequest, id: string) => {
    const user = (request as any).user;

    if (user.role !== "ADMIN") {
      throw new UnauthorizedException("Admin access required");
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException("Event not found");
    }

    await prisma.event.delete({
      where: {
        id,
      },
    });

    return sendResponse.success(null, "Event deleted successfully", 204);
  };
}
