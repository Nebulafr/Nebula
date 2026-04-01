import { NextRequest, NextResponse } from 'next/server';
import { type AuthenticatedRequest } from '@/types';
import { stripeAccountService } from '../services/stripe-account.service';
import { coachDashboardService } from '../services/coach-dashboard.service';
import { sendSuccess, sendError } from '../utils/send-response';

export class StripeAccountController {
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;

      const accountId = await stripeAccountService.createAccount(user.id);

      return sendSuccess({ accountId }, 'Stripe Connect account created');
    } catch (error: any) {
      console.error('Stripe Account Creation error:', error);
      return sendError(error.message || 'Failed to create Stripe account', 500);
    }
  }

  async onboard(request: NextRequest): Promise<NextResponse> {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;
      const body = await request.json();
      const { returnUrl, refreshUrl } = body;

      if (!returnUrl || !refreshUrl) {
        return sendError('Missing returnUrl or refreshUrl', 400);
      }

      const result = await stripeAccountService.createAccountLink(
        user.id,
        returnUrl,
        refreshUrl,
      );
      return sendSuccess(result, 'Onboarding link generated');
    } catch (error: any) {
      console.error('Stripe Onboarding error:', error);
      return sendError(
        error.message || 'Failed to initiate Stripe onboarding',
        500,
      );
    }
  }

  async getStatus(request: NextRequest): Promise<NextResponse> {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;
      const result = await stripeAccountService.getAccountStatus(user.id);
      return sendSuccess(result, 'Stripe account status retrieved');
    } catch (error: any) {
      console.error('Stripe Status error:', error);
      return sendError(
        error.message || 'Failed to retrieve Stripe status',
        500,
      );
    }
  }

  async getBalance(request: NextRequest): Promise<NextResponse> {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;
      const result = await stripeAccountService.getBalance(user.id);
      return sendSuccess(result, 'Account balance retrieved successfully');
    } catch (error: any) {
      console.error('Stripe Balance error:', error);
      return sendError(
        error.message || 'Failed to retrieve Stripe balance',
        500,
      );
    }
  }

  async requestPayout(request: NextRequest): Promise<NextResponse> {
    try {
      const user = (request as unknown as AuthenticatedRequest).user;
      const body = await request.json();
      const { amount } = body;

      if (!amount || amount <= 0) {
        return sendError('Invalid amount', 400);
      }

      const result = await coachDashboardService.requestPayout(user.id, amount);
      return sendSuccess(result, 'Payout request submitted successfully');
    } catch (error: any) {
      console.error('Payout request error:', error);
      return sendError(error.message || 'Failed to submit payout request', 500);
    }
  }
}

export const stripeAccountController = new StripeAccountController();
