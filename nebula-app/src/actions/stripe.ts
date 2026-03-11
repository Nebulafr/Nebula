import { apiPost, apiGet } from "@/lib/utils";

export interface CreateStripeAccountPayload {
  email: string;
  fullName: string;
  countryIso: string;
}

export async function createStripeAccount(
  payload: CreateStripeAccountPayload
): Promise<{ success: boolean; accountId?: string; message?: string }> {
  return apiPost("/stripe-account/create", payload);
}

export async function getStripeStatus(): Promise<any> {
  return apiGet("/stripe-account/status");
}

export async function onboardStripeAccount(
  returnUrl: string,
  refreshUrl: string
): Promise<any> {
  return apiPost("/stripe-account/onboard", { returnUrl, refreshUrl });
}

export async function getStripeBalance(): Promise<any> {
  return apiGet("/coaches/payouts/balance");
}

export async function getCoachEarnings(): Promise<any> {
  return apiGet("/coaches/payouts/earnings");
}

export async function getCoachPayouts(limit: number = 5): Promise<any> {
  return apiGet(`/coaches/payouts?limit=${limit}`);
}
