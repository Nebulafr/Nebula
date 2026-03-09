import { NextRequest } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { stripeAccountService } from "../services/stripe-account.service";
import { sendSuccess, sendError } from "../utils/send-response";

export class StripeAccountController {
  async create(request: NextRequest) {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;
      const body = await request.json().catch(() => ({}));
      const { email, fullName, countryIso } = body as {
        email?: string;
        fullName?: string;
        countryIso?: string;
      };

      const accountId = await stripeAccountService.createAccount(user.id, {
        email,
        fullName,
        countryIso,
      });
      return sendSuccess({ accountId }, "Stripe Connect account created");
    } catch (error: any) {
      console.error("Stripe Account Creation error:", error);
      return sendError(error.message || "Failed to create Stripe account", 500);
    }
  }

  async onboard(request: NextRequest) {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;
      const body = await request.json();
      const { returnUrl, refreshUrl } = body;

      if (!returnUrl || !refreshUrl) {
        return sendError("Missing returnUrl or refreshUrl", 400);
      }

      return await stripeAccountService.createAccountLink(user.id, returnUrl, refreshUrl);
    } catch (error: any) {
      console.error("Stripe Onboarding error:", error);
      return sendError(error.message || "Failed to initiate Stripe onboarding", 500);
    }
  }

  async getStatus(request: NextRequest) {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;
      return await stripeAccountService.getAccountStatus(user.id);
    } catch (error: any) {
      console.error("Stripe Status error:", error);
      return sendError(error.message || "Failed to retrieve Stripe status", 500);
    }
  }
}

export const stripeAccountController = new StripeAccountController();
