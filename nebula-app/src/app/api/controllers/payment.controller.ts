import { type AuthenticatedRequest } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "../services/payment.service";
import { BadRequestException, UnauthorizedException } from "../utils/http-exception";
import { z } from "zod";

const refundSchema = z.object({
    type: z.enum(["PROGRAM", "SESSION", "EVENT"]),
    id: z.string(),
});

export class PaymentController {
    async refundPayment(request: NextRequest) {
        let body;
        try {
            body = await request.json();
        } catch {
            throw new BadRequestException("Invalid JSON body");
        }

        const user = (request as unknown as AuthenticatedRequest).user;
        if (!user) {
            throw new UnauthorizedException("Authentication required");
        }



        const { type, id } = refundSchema.parse(body);
        await paymentService.processRefund(type, id);

        return NextResponse.json({ success: true, message: "Refund processed successfully" });
    }
}

export const paymentController = new PaymentController();
