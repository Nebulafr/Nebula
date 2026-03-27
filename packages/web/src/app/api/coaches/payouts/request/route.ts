import { NextRequest } from "next/server";
import CatchError from "../../../utils/catch-error";
import { isAuthenticated } from "../../../middleware/auth";
import { stripeAccountController } from "../../../controllers/stripe-account.controller";

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await stripeAccountController.requestPayout(req),
  ),
);
