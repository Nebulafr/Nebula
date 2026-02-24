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
  BadRequestException,
} from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";
import { generateSlug } from "@/lib/utils";
import { paymentService } from "./payment.service";
import { uploadService } from "./upload.service";

export class EventService {
  create = async (request: NextRequest, data: CreateEventData) => {
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
    let { organizerId, images, ...eventData } = payload as any;

    if (images && images.length > 0) {
      images = await Promise.all(
        images.map(async (image: string) => {
          if (image.startsWith("data:")) {
            const result = await uploadService.uploadFile(image, {
              folder: `nebula-events/${data.slug}`,
              resourceType: "image",
            });
            return result.url;
          }
          return image;
        })
      );
    }

    // Robustness: If organizerId is a Coach.id, resolve it to User.id
    if (organizerId) {
      const coach = await prisma.coach.findUnique({
        where: { id: organizerId },
        select: { userId: true },
      });
      if (coach) {
        organizerId = coach.userId;
      }
    }

    const event = await prisma.event.create({
      data: {
        ...eventData,
        images: images || [],
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
      accessType: event.accessType,
      price: (event as any).price || 0,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendSuccess(
      { event: transformedEvent },
      "Event created successfully",
      201,
    );
  };

  find = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const status = searchParams.get("status") || undefined;
    const accessType = searchParams.get("accessType") || undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? parseInt(limitParam) : 20;
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    const isPublicParam = searchParams.get("isPublic");

    const whereClause: any = {};

    if (isPublicParam !== null) {
      whereClause.isPublic = isPublicParam === "true";
    }

    if (eventType) {
      whereClause.eventType = eventType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (accessType && accessType !== "all") {
      whereClause.accessType = accessType;
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
      accessType: event.accessType,
      price: (event as any).price || 0,
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

  findById = async (id: string) => {
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
      accessType: event.accessType,
      price: (event as any).price || 0,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendSuccess({ event: transformedEvent });
  };

  findBySlug = async (slug: string) => {
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
      accessType: event.accessType,
      price: (event as any).price || 0,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return sendSuccess({ event: transformedEvent });
  };

  update = async (
    request: NextRequest,
    id: string,
    data: UpdateEventData,
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

    if (eventData.images && eventData.images.length > 0) {
      eventData.images = await Promise.all(
        eventData.images.map(async (image: string) => {
          if (image.startsWith("data:")) {
            const result = await uploadService.uploadFile(image, {
              folder: `nebula-events/${existingEvent.slug}`,
              resourceType: "image",
            });
            return result.url;
          }
          return image;
        })
      );
    }

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
      accessType: event!.accessType,
      price: event!.price,
      createdAt: event!.createdAt.toISOString(),
      updatedAt: event!.updatedAt.toISOString(),
    };

    return sendSuccess(
      { event: transformedEvent },
      "Event updated successfully",
    );
  };

  remove = async (request: NextRequest, id: string) => {
    const user = (request as any).user;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return sendSuccess({ event: null }, "Event already deleted or not found", 200);
    }

    if (user.role !== "ADMIN" && existingEvent.organizerId !== user.id) {
      throw new UnauthorizedException(
        "You are not authorized to delete this event",
      );
    }

    const paidAttendees = await prisma.eventAttendee.findMany({
      where: {
        eventId: id,
        paymentStatus: "PAID",
        status: {
          in: ["REGISTERED", "CONFIRMED"],
        },
        event: {
          price: {
            gt: 0,
          }
        }

      },
      select: { id: true },
    });

    if (paidAttendees.length > 0) {
      console.log(
        `Found ${paidAttendees.length} paid attendees for event ${id}. Processing refunds...`,
      );

      for (const attendee of paidAttendees) {
        try {
          await paymentService.processRefund("EVENT", attendee.id);
          console.log(`Refunded attendee ${attendee.id}`);
        } catch (error) {
          console.error(`Failed to refund attendee ${attendee.id}:`, error);
          throw new BadRequestException(
            `Failed to process refund for attendee ${attendee.id}. Deletion aborted. Please try again or contact support. Error: ${(error as Error).message}`,
          );
        }
      }
    }

    await prisma.event.delete({
      where: {
        id,
      },
    });

    return sendSuccess({ event: null }, "Event deleted successfully", 200);
  };

  registerForEvent = async (userId: string, eventId: string) => {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          student: { select: { id: true } },
        },
      });

      if (!user || !user.student) {
        throw new NotFoundException("Student profile not found");
      }

      const studentId = user.student.id;

      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: {
              attendees: {
                where: {
                  status: { in: ["REGISTERED", "CONFIRMED", "ATTENDED"] },
                },
              },
            },
          },
        },
      });

      if (!event) {
        throw new NotFoundException("Event not found");
      }

      if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
        throw new BadRequestException(
          "This event has reached its maximum capacity",
        );
      }

      const existingRegistration = await tx.eventAttendee.findUnique({
        where: {
          eventId_studentId: {
            eventId,
            studentId,
          },
        },
      });

      if (existingRegistration) {
        throw new BadRequestException("Already registered for this event");
      }

      const registration = await tx.eventAttendee.create({
        data: {
          studentId,
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
            registeredAt: registration.registeredAt,
          },
        },
        "Successfully registered for event",
        201,
      );
    });
  };

  unregisterFromEvent = async (userId: string, eventId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        student: { select: { id: true } },
      },
    });

    if (!user || !user.student) {
      throw new NotFoundException("Student profile not found");
    }

    const studentId = user.student.id;

    const registration = await prisma.eventAttendee.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId,
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
          studentId,
        },
      },
    });

    return sendSuccess(
      { message: "Successfully unregistered from event" },
      "Successfully unregistered from event",
    );
  };
}

export const eventService = new EventService();
