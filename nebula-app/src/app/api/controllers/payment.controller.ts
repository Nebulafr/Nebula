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
        } catch (error) {
            throw new BadRequestException("Invalid JSON body");
        }

        const user = (request as any).user;
        if (!user) {
            throw new UnauthorizedException("Authentication required");
        }

        // TODO: Add Authorization check (e.g. only Admin or the user themselves depending on policy)
        // For now, allow logged in users to trigger (dangerous in prod, should be restricted)

        const { type, id } = refundSchema.parse(body);
        await paymentService.processRefund(type, id);

        return NextResponse.json({ success: true, message: "Refund processed successfully" });
    }
}

export const paymentController = new PaymentController();
