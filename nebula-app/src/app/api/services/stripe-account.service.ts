import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { NotFoundException } from '../utils/http-exception';
import { sendSuccess } from '../utils/send-response';

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

    return sendSuccess({ url: accountLink.url }, 'Onboarding link generated');
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

    return sendSuccess(
      { url: accountLink.url },
      'Account update link generated',
    );
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
      return sendSuccess(
        {
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
        },
        'Stripe account not found',
      );
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

    return sendSuccess(status, 'Stripe account status retrieved');
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
      return sendSuccess(
        { available: [], pending: [] },
        'Stripe account not found',
      );
    }

    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: user.stripeAccountId,
      });

      const available = balance.available.reduce(
        (acc, b) => acc + b.amount / 100,
        0,
      );

      const pending = balance.pending.reduce(
        (acc, b) => acc + b.amount / 100,
        0,
      );

      return sendSuccess(
        { available, pending },
        'Stripe balance retrieved successfully',
      );
    } catch (error: any) {
      console.error('Stripe Balance Retrieval error:', error);
      return sendSuccess(
        { available: [], pending: [] },
        'Could not retrieve Stripe balance',
      );
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

    return sendSuccess({ url: loginLink.url }, 'Login link generated');
  }
}

export const stripeAccountService = new StripeAccountService();
