import { NextRequest } from "next/server";
import catchError from "@/app/api/utils/catch-error";
import { paymentController } from "../../controllers/payment.controller";
import { isAuthenticated } from "../../middleware/auth";

export const POST = catchError(
    isAuthenticated(async (req: NextRequest) => await paymentController.refundPayment(req))
);
