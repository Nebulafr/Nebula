import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NotFoundException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

export class StripeAccountService {
  async createAccount(
    userId: string,
    userData?: { email?: string; fullName?: string; countryIso?: string }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, stripeAccountId: true, fullName: true, countryIso: true } as any,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.stripeAccountId) {
      return user.stripeAccountId;
    }

    const email = userData?.email || user.email;
    const fullName = userData?.fullName || user.fullName || undefined;
    const countryIso = userData?.countryIso || (user as any).countryIso || undefined;

    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        full_name: fullName,
      },
      metadata: {
        userId: user.id,
      },
      country: countryIso,
    } as any);

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeAccountId: account.id,
      },
    });

    return account.id as string;
  }

  async createAccountLink(userId: string, returnUrl: string, refreshUrl: string) {
    const stripeAccountId = await this.createAccount(userId) as unknown as string;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return sendSuccess({ url: accountLink.url }, "Onboarding link generated");
  }

  async getAccountStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true, isStripeConnected: true },
    });

    if (!user || !user.stripeAccountId) {
      return sendSuccess({
        isConnected: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }, "Stripe account not found");
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    const status = {
      isConnected: user.isStripeConnected,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due || [],
    };

    // If status changed in Stripe but NOT in our DB, sync it
    if (account.details_submitted && !user.isStripeConnected) {
      await prisma.user.update({
        where: { id: userId },
        data: { isStripeConnected: true },
      });
      status.isConnected = true;
    }

    return sendSuccess(status, "Stripe account status retrieved");
  }


}

export const stripeAccountService = new StripeAccountService();
