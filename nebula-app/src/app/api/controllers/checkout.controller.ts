import { NextRequest } from "next/server";
import { checkoutService } from "../services/checkout.service";
import { checkoutProgramSchema, checkoutSessionSchema, checkoutEventSchema } from "@/lib/validations/checkout";
import { BadRequestException, UnauthorizedException } from "../utils/http-exception";

export class CheckoutController {
    async createProgramCheckout(request: NextRequest) {
        let body;
        try {
            body = await request.json();
        } catch {
            throw new BadRequestException("Invalid JSON body");
        }

        const user = (request as unknown as {
            user: {
                email: string; id: string
            }
        }).user;
        if (!user) {
            throw new UnauthorizedException("Authentication required");
        }

        const payload = checkoutProgramSchema.parse(body);
        return await checkoutService.createProgramCheckout(user.id, user.email, payload);
    }

    async createSessionCheckout(request: NextRequest) {
        let body;
        try {
            body = await request.json();
        } catch {
            throw new BadRequestException("Invalid JSON body");
        }

        const user = (request as unknown as {
            user: {
                email: string; id: string
            }
        }).user;
        if (!user) {
            throw new UnauthorizedException("Authentication required");
        }

        const payload = checkoutSessionSchema.parse(body);
        return await checkoutService.createSessionCheckout(user.id, user.email, payload);
    }

    async createEventCheckout(request: NextRequest) {
        let body;
        try {
            body = await request.json();
        } catch {
            throw new BadRequestException("Invalid JSON body");
        }

        const user = (request as unknown as { user: { id: string, email: string } }).user;
        if (!user) {
            throw new UnauthorizedException("Authentication required");
        }

        const payload = checkoutEventSchema.parse(body);
        return await checkoutService.createEventCheckout(user.id, user.email, payload);
    }
}

export const checkoutController = new CheckoutController();
