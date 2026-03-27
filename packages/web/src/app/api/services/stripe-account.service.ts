import { stripe } from "@nebula/integrations";
import { prisma } from "@nebula/database";
import { NotFoundException } from '../utils/http-exception';
import { coachDashboardService } from './coach-dashboard.service';

export class StripeAccountService {
  /**
   * Create an Express connected account
   */
  async createAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
        fullName: true,
        firstName: true,
        lastName: true,
        countryIso: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.stripeAccountId) {
      return user.stripeAccountId;
    }

    const fullName = user.fullName || '';
    const countryIso = user.countryIso || 'US';
    const email = user.email || '';

    const nameParts = fullName.split(' ') || [];
    const firstName = user.firstName || nameParts[0] || '';
    const lastName =
      user.lastName || nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: countryIso,
      email: email,
      capabilities: {
        transfers: {
          requested: true,
        },
      },
      business_type: 'individual',
      business_profile: {
        url: 'https://www.nebulaengage.com',
        product_description: 'Description of services',
      },
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email,
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual', // or 'daily', 'weekly', 'monthly'
          },
        },
      },
      metadata: {
        userId: user.id,
      },
    });

    // Also create a person record for the individual
    if (firstName || lastName) {
      await stripe.accounts
        .createPerson(account.id, {
          first_name: firstName,
          last_name: lastName,
          email: email,
          relationship: {
            representative: true,
          },
        })
        .catch((err) => {
          // Person creation might fail if account already has one
          // Log but don't fail the overall account creation
          console.log('Person creation (optional) failed:', err.message);
        });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeAccountId: account.id,
      },
    });

    return account.id;
  }

  /**
   * Create an onboarding link for Express account
   */
  async createAccountLink(
    userId: string,
    returnUrl: string,
    refreshUrl: string,
    options?: {
      collect?: 'currently_due' | 'eventually_due';
    },
  ) {
    const stripeAccountId = await this.createAccount(userId);

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
      collection_options: {
        fields: options?.collect || 'eventually_due', // 'currently_due' for incremental
        // future_requirements: 'include', // Uncomment to include future requirements
      },
    });

    return { url: accountLink.url };
  }

  /**
   * Create an account update link for editing existing information
   */
  async createAccountUpdateLink(
    userId: string,
    returnUrl: string,
    refreshUrl: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });

    if (!user?.stripeAccountId) {
      throw new NotFoundException('Stripe account not found');
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_update',
    });

    return { url: accountLink.url };
  }

  /**
   * Get the current status of an Express account
   */
  async getAccountStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true, isStripeConnected: true },
    });

    if (!user || !user.stripeAccountId) {
      return {
        isConnected: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        requirements: {
          currentlyDue: [],
          eventuallyDue: [],
          pastDue: [],
        },
        capabilities: {},
      };
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    const status = {
      isConnected: user.isStripeConnected,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
      },
      capabilities: {
        transfers: account.capabilities?.transfers === 'active',
      },
      disabledReason: account.requirements?.disabled_reason,
    };

    // Sync status if changed in Stripe but not in DB
    if (account.details_submitted && !user.isStripeConnected) {
      await prisma.user.update({
        where: { id: userId },
        data: { isStripeConnected: true },
      });
      status.isConnected = true;
    }

    return status;
  }

  /**
   * Get account balance
   */
  async getBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });

    if (!user || !user.stripeAccountId) {
      return { available: [], pending: [] };
    }

    try {
      // Use system data for balance
      const balanceInCents = await coachDashboardService.getTotalEarningBalance(userId);
      const available = balanceInCents / 100;

      // We can still fetch Stripe balance for comparison or internal logging if needed,
      // but the response to the frontend will now prioritize our system data.
      let stripeAvailable = 0;
      let stripePending = 0;

      if (user.stripeAccountId) {
        try {
          const stripeBalance = await stripe.balance.retrieve({
            stripeAccount: user.stripeAccountId,
          });
          stripeAvailable = stripeBalance.available.reduce((acc, b) => acc + b.amount / 100, 0);
          stripePending = stripeBalance.pending.reduce((acc, b) => acc + b.amount / 100, 0);
        } catch (sError) {
          console.warn('Could not fetch Stripe balance for comparison:', sError);
        }
      }

      return {
        available,
        pending: stripePending, // Keep pending from Stripe as we don't track pending as closely
        systemBalance: available,
        stripeAvailable
      };
    } catch (error: any) {
      console.error('Balance Retrieval error:', error);
      return { available: 0, pending: 0 };
    }
  }

  /**
   * Handle refresh URL - create new link when old one expires
   */
  async refreshOnboardingLink(
    userId: string,
    returnUrl: string,
    refreshUrl: string,
  ) {
    return this.createAccountLink(userId, returnUrl, refreshUrl);
  }

  /**
   * Create a login link for the Express Dashboard
   */
  async createLoginLink(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });

    if (!user?.stripeAccountId) {
      throw new NotFoundException('Stripe account not found');
    }

    const loginLink = await stripe.accounts.createLoginLink(
      user.stripeAccountId,
    );

    return { url: loginLink.url };
  }
}

export const stripeAccountService = new StripeAccountService();
