import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NotFoundException } from "../utils/http-exception";
import { CheckoutProgramData, CheckoutSessionData, CheckoutEventData } from "@/lib/validations/checkout";
import { paymentService } from "./payment.service";
import { sessionService } from "./session.service";
import { sendSuccess } from "../utils/send-response";

export class CheckoutService {
    async createProgramCheckout(userId: string, email: string, data: CheckoutProgramData) {
        const { programId, cohortId } = data;

        const program = await prisma.program.findUnique({
            where: { id: programId },
        });

        if (!program) {
            throw new NotFoundException("Program not found");
        }

        if (program.price === 0) {
            await paymentService.handleProgramEnrollment(programId, userId, null, cohortId);
            return sendSuccess({ url: data.successUrl });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: program.title,
                            description: program.description ? program.description.substring(0, 255) : undefined,
                        },
                        unit_amount: program.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: data.successUrl,
            cancel_url: data.cancelUrl,
            customer_email: email,
            metadata: {
                type: "PROGRAM_ENROLLMENT",
                programId: program.id,
                userId: userId,
                cohortId: cohortId || "",
            },
        });

        return sendSuccess({ url: session.url });
    }

    async createSessionCheckout(userId: string, email: string, data: CheckoutSessionData) {
        const { coachId, scheduledTime, duration, timezone } = data;

        // Validate booking first (checks availability, conflicts, etc.)
        const { coach } = await sessionService.validateBooking({
            coachId,
            studentUserId: userId,
            scheduledTime: new Date(scheduledTime),
            duration,
            timezone,
        });

        const price = Math.round((coach.hourlyRate * duration) / 60);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Coaching Session with ${coach.user.fullName || "Coach"}`,
                            description: `${duration} minute session on ${new Date(scheduledTime).toLocaleString()}`,
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: data.successUrl,
            cancel_url: data.cancelUrl,
            customer_email: email,
            metadata: {
                type: "SESSION_BOOKING",
                coachId: coach.id,
                userId: userId,
                scheduledTime: scheduledTime,
                duration: duration.toString(),
                timezone: timezone || "",
            },
        });

        return sendSuccess({ url: session.url });
    }

    async createEventCheckout(userId: string, email: string, data: CheckoutEventData) {
        const { eventId } = data;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException("Event not found");
        }

        if (event.price === 0) {
            await paymentService.handleEventRegistration(eventId, userId, null);
            return sendSuccess({ url: data.successUrl });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: event.title,
                            description: event.description.substring(0, 255),
                        },
                        unit_amount: event.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: data.successUrl,
            cancel_url: data.cancelUrl,
            customer_email: email,
            metadata: {
                type: "EVENT_REGISTRATION",
                eventId: event.id,
                userId: userId,
            },
        });

        return sendSuccess({ url: session.url });
    }
}

export const checkoutService = new CheckoutService();
