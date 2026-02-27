import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

function verifyJWT(token: string): { userId: string } | null {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";
     
    const decoded = jwt.verify(token, secret) as any;

    if (decoded.type === "access" && decoded.userId) {
      return { userId: decoded.userId };
    }

    return null;
   
  } catch (error) {
    return null;
  }
}

export async function extractUserFromRequest(
  request: NextRequest
): Promise<{ id: string } | null> {
  try {
    const authHeader = request.headers.get("Authorization");

    console.log({ authHeader });

    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    return user;
  } catch (error) {
    console.error("Error extracting user from request:", error);
    return null;
  }
}
