import { NextRequest } from "next/server";
import { requireCoach } from "../../middleware/auth";
import CatchError from "../../utils/catch-error";
import { prisma } from "@/lib/prisma";
import { sendSuccess } from "../../utils/send-response";
import { NotFoundException } from "../../utils/http-exception";

// GET /api/coaches/availability - Get coach's availability settings
export const GET = CatchError(
  requireCoach(async (req: NextRequest) => {
    const user = (req as any).user;

    const coach = await prisma.coach.findUnique({
      where: { userId: user.id },
      select: { availability: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    // Parse stored JSON availability or return default
    let availability;
    try {
      availability = JSON.parse(coach.availability || "{}");
    } catch {
      availability = {};
    }

    return sendSuccess({ availability }, "Availability fetched successfully");
  })
);

// PUT /api/coaches/availability - Update coach's availability settings
export const PUT = CatchError(
  requireCoach(async (req: NextRequest) => {
    const user = (req as any).user;
    const body = await req.json();

    const coach = await prisma.coach.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!coach) {
      throw new NotFoundException("Coach profile not found");
    }

    // Validate availability data
    const { availability } = body;
    if (!availability || typeof availability !== "object") {
      throw new Error("Invalid availability data");
    }

    // Store as JSON string
    await prisma.coach.update({
      where: { id: coach.id },
      data: {
        availability: JSON.stringify(availability),
      },
    });

    return sendSuccess({ availability }, "Availability updated successfully");
  })
);

