import { NextRequest } from "next/server";
import { stripeAccountController } from "../../controllers/stripe-account.controller";
import CatchError from "../../utils/catch-error";
import { isAuthenticated } from "../../middleware/auth";

export const POST = CatchError(
  isAuthenticated(async (req: NextRequest) => await stripeAccountController.onboard(req))
);
