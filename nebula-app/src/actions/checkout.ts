import { apiPost } from "@/lib/utils";

export async function createProgramCheckout(data: {
    programId: string;
    cohortId?: string;
    successUrl: string;
    cancelUrl: string;
}) {
    return apiPost("/checkout/program", data);
}

export async function createSessionCheckout(data: {
    coachId: string;
    scheduledTime: string;
    duration: number;
    successUrl: string;
    cancelUrl: string;
}) {
    return apiPost("/checkout/session", data);
}

export async function createEventCheckout(data: {
    eventId: string;
    successUrl: string;
    cancelUrl: string;
}) {
    return apiPost("/checkout/event", data);
}
