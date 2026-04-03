import { stripe } from "../index.js";

export class StripeAccountService {
  /**
   * Create an Express connected account
   */
  async createAccount(data: {
    userId: string;
    email: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    countryIso?: string;
  }): Promise<string> {
    const { userId, email, fullName, firstName, lastName, countryIso = 'US' } = data;

    const nameParts = fullName.split(' ') || [];
    const fName = firstName || nameParts[0] || '';
    const lName = lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

    const account = await stripe.accounts.create({
      type: 'express',
      country: countryIso,
      email: email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        url: 'https://www.nebulaengage.com',
        product_description: 'Coaching services on Nebula',
      },
      individual: {
        first_name: fName,
        last_name: lName,
        email: email,
      },
      metadata: { userId },
    });

    return account.id;
  }

  /**
   * Create an onboarding link
   */
  async createAccountLink(params: {
    stripeAccountId: string;
    returnUrl: string;
    refreshUrl: string;
    collect?: 'currently_due' | 'eventually_due';
  }): Promise<{ url: string }> {
    const accountLink = await stripe.accountLinks.create({
      account: params.stripeAccountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: 'account_onboarding',
      collection_options: {
        fields: params.collect || 'eventually_due',
      },
    });

    return { url: accountLink.url };
  }

  /**
   * Get account status
   */
  async getAccountStatus(stripeAccountId: string): Promise<any> {
    const account = await stripe.accounts.retrieve(stripeAccountId);

    return {
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
      },
      disabledReason: account.requirements?.disabled_reason,
    };
  }

  /**
   * Get account balance from Stripe
   */
  async getStripeBalance(stripeAccountId: string): Promise<{ available: number; pending: number }> {
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId,
    });

    const available = balance.available.reduce((acc, b) => acc + b.amount / 100, 0);
    const pending = balance.pending.reduce((acc, b) => acc + b.amount / 100, 0);

    return { available, pending };
  }

  /**
   * Create login link for Express dashboard
   */
  async createLoginLink(stripeAccountId: string): Promise<{ url: string }> {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return { url: loginLink.url };
  }
}

export const stripeAccountService = new StripeAccountService();
