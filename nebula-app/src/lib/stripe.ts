import Stripe from "stripe";
import { env } from "@/config/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
   
  apiVersion: "2022-08-01" as any, // Use formatted version string or latest
  typescript: true,
});
