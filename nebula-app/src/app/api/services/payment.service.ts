import { prisma } from "@/lib/prisma";
import { PaymentStatus, SessionStatus, EnrollmentStatus, EventAttendeeStatus } from "@/generated/prisma";
import Stripe from "stripe";
import { NotFoundException, BadRequestException } from "../utils/http-exception";
import { stripe } from "@/lib/stripe";
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
        });

        if (existingEnrollment) {
            // Update existing enrollment if it was pending or handle idempotency
            await prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: {
                    status: EnrollmentStatus.ACTIVE,
                    paymentStatus: PaymentStatus.PAID,
                    stripeSessionId,
                }
            });
            return;
        }

        await prisma.enrollment.create({
            data: {
                programId,
                studentId: student.id,
                cohortId: cohortId || undefined,
                coachId: program.coachId,
                status: EnrollmentStatus.ACTIVE,
                paymentStatus: PaymentStatus.PAID,
                stripeSessionId,
            },
        });
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
            await prisma.eventAttendee.update({
                where: { id: existingRegistration.id },
                data: {
                    status: EventAttendeeStatus.REGISTERED,
                    paymentStatus: PaymentStatus.PAID,
                    stripeSessionId,
                }
            });
            return;
        }

        await prisma.eventAttendee.create({
            data: {
                eventId,
                studentId: student.id,
                status: EventAttendeeStatus.REGISTERED,
                paymentStatus: PaymentStatus.PAID,
                stripeSessionId,
            },
        });

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
            const enrollment = await prisma.enrollment.findUnique({ where: { id } });
            if (!enrollment) throw new NotFoundException("Enrollment not found");
            stripeSessionId = enrollment.stripeSessionId;
            updateStatus = async () => {
                await prisma.enrollment.update({
                    where: { id },
                    data: { status: EnrollmentStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED },
                });
            };
        } else if (type === "SESSION") {
            const session = await prisma.session.findUnique({ where: { id } });
            if (!session) throw new NotFoundException("Session not found");
            stripeSessionId = session.stripeSessionId;
            updateStatus = async () => {
                await prisma.session.update({
                    where: { id },
                    data: { status: SessionStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED },
                });
            };
        } else if (type === "EVENT") {
            const attendee = await prisma.eventAttendee.findUnique({ where: { id } });
            if (!attendee) throw new NotFoundException("Event attendee not found");
            stripeSessionId = attendee.stripeSessionId;
            updateStatus = async () => {
                await prisma.eventAttendee.update({
                    where: { id },
                    data: { status: EventAttendeeStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED },
                });
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
