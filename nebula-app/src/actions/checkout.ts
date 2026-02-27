import { apiPost } from "@/lib/utils";
import { CheckoutResponse } from "@/types";

export async function createProgramCheckout(data: {
    programId: string;
    cohortId?: string;
    successUrl: string;
    cancelUrl: string;
}): Promise<CheckoutResponse> {
    return apiPost<CheckoutResponse["data"]>("/checkout/program", data) as Promise<CheckoutResponse>;
}

export async function createSessionCheckout(data: {
    coachId: string;
    scheduledTime: string;
    duration: number;
    successUrl: string;
    cancelUrl: string;
}): Promise<CheckoutResponse> {
    return apiPost<CheckoutResponse["data"]>("/checkout/session", data) as Promise<CheckoutResponse>;
}

export async function createEventCheckout(data: {
    eventId: string;
    successUrl: string;
    cancelUrl: string;
}): Promise<CheckoutResponse> {
    return apiPost<CheckoutResponse["data"]>("/checkout/event", data) as Promise<CheckoutResponse>;
}
