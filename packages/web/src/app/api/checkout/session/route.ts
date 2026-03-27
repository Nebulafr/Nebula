import { NextRequest } from "next/server";
import catchError from "@/app/api/utils/catch-error";
import { checkoutController } from "../../controllers/checkout.controller";
import { isAuthenticated } from "../../middleware/auth";

export const POST = catchError(
    isAuthenticated(async (req: NextRequest) => await checkoutController.createSessionCheckout(req))
);
