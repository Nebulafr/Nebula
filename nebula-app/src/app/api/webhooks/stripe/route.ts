import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { paymentService } from "../../services/payment.service";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
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
            console.error("Error processing webhook:", error);
            return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
