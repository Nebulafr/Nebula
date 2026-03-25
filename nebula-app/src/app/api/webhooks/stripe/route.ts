import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/providers";
import { paymentService } from "../../services/payment.service";
import { prisma } from "@/lib/providers";
import Stripe from "stripe";
import { env } from "@/config/env";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET!
        );
     
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("Checkout session completed:", session);
        try {
            console.log("Checkout session completed:", session.id);
            await paymentService.handleCheckoutSessionCompleted(session);
        } catch (error) {
            console.error("Error processing checkout webhook:", error);
            return NextResponse.json({ error: "Error processing checkout webhook" }, { status: 500 });
        }
    } else if (event.type === "account.updated") {
        const account = event.data.object as Stripe.Account;
        console.log("Account updated:", account.id);

        try {
            // Sync connection status based on details_submitted
            if (account.details_submitted) {
                await prisma.user.updateMany({
                    where: { stripeAccountId: account.id },
                    data: { isStripeConnected: true },
                });
                console.log(`Synced connection status for account: ${account.id}`);
            }
        } catch (error) {
            console.error("Error processing account update webhook:", error);
            // We don't necessarily want to return 500 here if it's just a sync failure
        }
    }

    return NextResponse.json({ received: true });
}
