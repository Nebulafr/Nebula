import {
  prisma,
  PaymentStatus,
  SessionStatus,
  EnrollmentStatus,
  EventAttendeeStatus,
  TransactionType,
  TransactionSourceType,
  TransactionStatus,
} from "@nebula/database";
import Stripe from "stripe";
import { NotFoundException, BadRequestException } from "../utils/http-exception";
import { stripe } from "@nebula/integrations";
import { emailService } from "./email.service";
import { sessionService } from "./session.service";

export class PaymentService {
    async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
        const { type, programId, userId, cohortId, coachId, scheduledTime, duration, eventId, timezone } = session.metadata || {};

        if (type === "PROGRAM_ENROLLMENT" && programId && userId) {
            await this.handleProgramEnrollment(programId, userId, session.id, cohortId);
        } else if (type === "SESSION_BOOKING" && coachId && userId && scheduledTime && duration) {
            await this.handleSessionBooking(coachId, userId, scheduledTime, duration, session.id, timezone);
        } else if (type === "EVENT_REGISTRATION" && eventId && userId) {
            await this.handleEventRegistration(eventId, userId, session.id);
        }
    }

    async handleProgramEnrollment(programId: string, userId: string, stripeSessionId: string | null, cohortId?: string) {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) throw new NotFoundException(`Student not found for userId: ${userId}`);

        const program = await prisma.program.findUnique({ where: { id: programId }, select: { coachId: true } });
        if (!program) throw new NotFoundException(`Program not found for programId: ${programId}`);

        // Check if enrollment already exists to avoid duplicates
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_programId: {
                    studentId: student.id,
                    programId: programId,
                },
            },
            include: { program: { select: { price: true, coach: { select: { userId: true } } } } }
        });

        if (existingEnrollment) {
            // Update existing enrollment if it was pending or handle idempotency
            const updatedEnrollment = await prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: {
                    status: EnrollmentStatus.ACTIVE,
                    paymentStatus: PaymentStatus.PAID,
                    stripeSessionId,
                },
                include: { program: { select: { price: true, coach: { select: { userId: true } } } } }
            });

            // Create Transaction
            if (updatedEnrollment.program.price > 0 && updatedEnrollment.program.coach.userId) {
                await prisma.transaction.create({
                    data: {
                        userId: updatedEnrollment.program.coach.userId,
                        amount: Math.round(updatedEnrollment.program.price * 100),
                        type: TransactionType.EARNING,
                        status: TransactionStatus.COMPLETED,
                        sourceType: TransactionSourceType.ENROLLMENT,
                        sourceId: updatedEnrollment.id,
                        description: `Earning from program enrollment: ${programId}`
                    }
                });
            }
            return;
        }

        const newEnrollment = await prisma.enrollment.create({
            data: {
                programId,
                studentId: student.id,
                cohortId: cohortId || undefined,
                coachId: program.coachId,
                status: EnrollmentStatus.ACTIVE,
                paymentStatus: PaymentStatus.PAID,
                stripeSessionId,
            },
            include: { program: { select: { price: true, coach: { select: { userId: true } } } } }
        });

        // Create Transaction
        if (newEnrollment.program.price > 0 && newEnrollment.program.coach.userId) {
            await prisma.transaction.create({
                data: {
                    userId: newEnrollment.program.coach.userId,
                    amount: Math.round(newEnrollment.program.price * 100),
                    type: TransactionType.EARNING,
                    status: TransactionStatus.COMPLETED,
                    sourceType: TransactionSourceType.ENROLLMENT,
                    sourceId: newEnrollment.id,
                    description: `Earning from program enrollment: ${programId}`
                }
            });
        }
    }

    private async handleSessionBooking(coachId: string, userId: string, scheduledTime: string, duration: string, stripeSessionId: string, timezone?: string) {
        await sessionService.completeSessionCheckout({
            coachId,
            studentUserId: userId,
            scheduledTime: new Date(scheduledTime),
            duration: parseInt(duration),
            stripeSessionId,
            timezone,
        });
    }

    async handleEventRegistration(eventId: string, userId: string, stripeSessionId: string | null) {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) throw new NotFoundException(`Student not found for userId: ${userId}`);

        // Check if registration already exists
        const existingRegistration = await prisma.eventAttendee.findUnique({
            where: {
                eventId_studentId: {
                    eventId,
                    studentId: student.id,
                }
            }
        });

        if (existingRegistration) {
            const updatedRegistration = await prisma.eventAttendee.update({
                where: { id: existingRegistration.id },
                data: {
                    status: EventAttendeeStatus.REGISTERED,
                    paymentStatus: PaymentStatus.PAID,
                    stripeSessionId,
                },
                include: { event: { select: { price: true, organizerId: true } } }
            });

            if (updatedRegistration.event.price > 0 && updatedRegistration.event.organizerId) {
                await prisma.transaction.create({
                    data: {
                        userId: updatedRegistration.event.organizerId,
                        amount: Math.round(updatedRegistration.event.price * 100),
                        type: TransactionType.EARNING,
                        status: TransactionStatus.COMPLETED,
                        sourceType: TransactionSourceType.EVENT,
                        sourceId: updatedRegistration.id,
                        description: `Earning from event registration: ${eventId}`
                    }
                });
            }
            return;
        }

        const newRegistration = await prisma.eventAttendee.create({
            data: {
                eventId,
                studentId: student.id,
                status: EventAttendeeStatus.REGISTERED,
                paymentStatus: PaymentStatus.PAID,
                stripeSessionId,
            },
            include: { event: { select: { price: true, organizerId: true } } }
        });

        if (newRegistration.event.price > 0 && newRegistration.event.organizerId) {
            await prisma.transaction.create({
                data: {
                    userId: newRegistration.event.organizerId,
                    amount: Math.round(newRegistration.event.price * 100),
                    type: TransactionType.EARNING,
                    status: TransactionStatus.COMPLETED,
                    sourceType: TransactionSourceType.EVENT,
                    sourceId: newRegistration.id,
                    description: `Earning from event registration: ${eventId}`
                }
            });
        }

        // Send confirmation email
        try {
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: { organizer: true }
            });

            if (event && event.lumaEventLink) {
                const organizerName = event.organizer?.fullName || "Unknown Organizer";
                const user = await prisma.user.findUnique({ where: { id: userId } });
                const userName = user?.fullName || "Valued Member";
                const userEmail = user?.email;

                if (userEmail) {
                    await emailService.sendEventRegistrationEmail(userEmail, {
                        userName,
                        eventTitle: event.title,
                        eventDate: event.date.toISOString(),
                        organizerName,
                        lumaEventLink: event.lumaEventLink,
                        eventImage: event.images?.[0]
                    });
                }
            }
        } catch (error) {
            console.error("Failed to send event registration email:", error);
            // Don't fail the registration if email fails
        }
    }

    async processRefund(type: "PROGRAM" | "SESSION" | "EVENT", id: string) {
        let stripeSessionId: string | null = null;
        let updateStatus: () => Promise<void>;

        if (type === "PROGRAM") {
            const enrollment = await prisma.enrollment.findUnique({ where: { id }, include: { program: { select: { price: true, coach: { select: { userId: true } } } } } });
            if (!enrollment) throw new NotFoundException("Enrollment not found");
            stripeSessionId = enrollment.stripeSessionId;
            updateStatus = async () => {
                await prisma.enrollment.update({
                    where: { id },
                    data: { status: EnrollmentStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED },
                });
                if (enrollment.program.price > 0 && enrollment.program.coach.userId) {
                    await prisma.transaction.create({
                        data: {
                            userId: enrollment.program.coach.userId,
                            amount: Math.round(enrollment.program.price * 100),
                            type: TransactionType.REFUND,
                            status: TransactionStatus.COMPLETED,
                            sourceType: TransactionSourceType.ENROLLMENT,
                            sourceId: enrollment.id,
                            description: `Refund for program enrollment: ${enrollment.programId}`
                        }
                    });
                }
            };
        } else if (type === "SESSION") {
            const session = await prisma.session.findUnique({ where: { id }, include: { coach: { select: { userId: true } } } });
            if (!session) throw new NotFoundException("Session not found");
            stripeSessionId = session.stripeSessionId;
            updateStatus = async () => {
                await prisma.session.update({
                    where: { id },
                    data: { status: SessionStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED },
                });
                if (session.price > 0 && session.coach.userId) {
                    await prisma.transaction.create({
                        data: {
                            userId: session.coach.userId,
                            amount: Math.round(session.price * 100),
                            type: TransactionType.REFUND,
                            status: TransactionStatus.COMPLETED,
                            sourceType: TransactionSourceType.SESSION,
                            sourceId: session.id,
                            description: `Refund for session booking: ${session.id}`
                        }
                    });
                }
            };
        } else if (type === "EVENT") {
            const attendee = await prisma.eventAttendee.findUnique({ where: { id }, include: { event: { select: { price: true, organizerId: true } } } });
            if (!attendee) throw new NotFoundException("Event attendee not found");
            stripeSessionId = attendee.stripeSessionId;
            updateStatus = async () => {
                await prisma.eventAttendee.update({
                    where: { id },
                    data: { status: EventAttendeeStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED },
                });
                if (attendee.event.price > 0 && attendee.event.organizerId) {
                    await prisma.transaction.create({
                        data: {
                            userId: attendee.event.organizerId,
                            amount: Math.round(attendee.event.price * 100),
                            type: TransactionType.REFUND,
                            status: TransactionStatus.COMPLETED,
                            sourceType: TransactionSourceType.EVENT,
                            sourceId: attendee.id,
                            description: `Refund for event registration: ${attendee.eventId}`
                        }
                    });
                }
            };
        } else {
            throw new BadRequestException("Invalid refund type");
        }

        if (!stripeSessionId) {
            throw new BadRequestException("No payment associated with this record");
        }

        const checkoutSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
        const paymentIntentId = checkoutSession.payment_intent as string;

        if (!paymentIntentId) {
            throw new BadRequestException("No Payment Intent found for this session");
        }

        await stripe.refunds.create({
            payment_intent: paymentIntentId,
        });

        await updateStatus();
    }
}

export const paymentService = new PaymentService();
