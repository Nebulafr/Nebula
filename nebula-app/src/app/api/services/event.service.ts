import { NextRequest } from "next/server";
import {
  CreateEventData,
  createEventSchema,
  UpdateEventData,
} from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import {
  UnauthorizedException,
  NotFoundException,
} from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";
import { generateSlug } from "@/lib/utils";

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
    const { organizerId, ...eventData } = payload as any;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        organizerId: organizerId || user.id,
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

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
      status: event.status,
      tags: event.tags,
      whatToBring: event.whatToBring,
      additionalInfo: event.additionalInfo,
      lumaEventLink: event.lumaEventLink,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendSuccess(
      { event: transformedEvent },
      "Event created successfully",
      201
    );
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
      whatToBring: event.whatToBring,
      additionalInfo: event.additionalInfo,
      lumaEventLink: event.lumaEventLink,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    return sendSuccess({
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
      lumaEventLink: event.lumaEventLink,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendSuccess({ event: transformedEvent });
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
            coach: {
              select: {
                totalReviews: true,
                rating: true,
              },
            },
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
    });

    console.log({ event });

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
      lumaEventLink: event.lumaEventLink,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendSuccess({ event: transformedEvent });
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

    const eventData = data as any;

    const event = await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id },
        data: eventData,
      });
      return await tx.event.findUnique({
        where: { id },
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
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
    });

    const transformedEvent = {
      id: event!.id,
      title: event!.title,
      description: event!.description,
      eventType: event!.eventType,
      date: event!.date.toISOString(),
      location: event!.location,
      images: event!.images || [],
      slug: event!.slug,
      organizer: (event as any)!.organizer
        ? {
            id: (event as any)!.organizer.id,
            fullName: (event as any)!.organizer.fullName,
            avatarUrl: (event as any)!.organizer.avatarUrl,
          }
        : null,
      isPublic: event!.isPublic,
      maxAttendees: event!.maxAttendees,
      attendees: (event as any)!._count.attendees,
      status: event!.status,
      tags: event!.tags,
      whatToBring: event!.whatToBring,
      additionalInfo: event!.additionalInfo,
      lumaEventLink: event!.lumaEventLink,
      createdAt: event!.createdAt.toISOString(),
      updatedAt: event!.updatedAt.toISOString(),
    };

    return sendSuccess(
      { event: transformedEvent },
      "Event updated successfully"
    );
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

    return sendSuccess(null, "Event deleted successfully", 204);
  };

  static registerForEvent = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    const existingRegistration = await prisma.eventAttendee.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId: userId,
        },
      },
    });

    if (existingRegistration) {
      throw new Error("Already registered for this event");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        fullName: true,
        student: { select: { id: true } },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const registration = await prisma.eventAttendee.create({
      data: {
        studentId: user.student!.id,
        eventId,
        status: "REGISTERED",
      },
    });

    return sendSuccess(
      {
        message: "Successfully registered for event",
        registration: {
          id: registration.id,
          eventId: registration.eventId,
          registeredAt: registration.registeredAt || registration.createdAt,
        },
      },
      "Successfully registered for event",
      201
    );
  };

  static unregisterFromEvent = async (userId: string, eventId: string) => {
    const registration = await prisma.eventAttendee.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId: userId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException("Not registered for this event");
    }

    await prisma.eventAttendee.delete({
      where: {
        eventId_studentId: {
          eventId,
          studentId: userId,
        },
      },
    });

    return sendSuccess(
      { message: "Successfully unregistered from event" },
      "Successfully unregistered from event"
    );
  };
}
