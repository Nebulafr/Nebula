import HttpException from "../utils/http-exception";
import { RESPONSE_CODE } from "@/types";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { UserRole } from "@/generated/prisma";
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

 
export function isAuthenticated(fn: Function) {
   
  return async (req: NextRequest, context?: any) => {
    const authHeader = req.headers.get("Authorization");
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Access token is required",
        401
      );
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Invalid or expired token",
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        coach: true,
        student: true,
      },
    });

    if (!user) {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Unauthorized, user not found",
        401
      );
    }

     
    (req as any)["user"] = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      coach: user.coach,
      student: user.student,
    };

    return await fn(req, context);
  };
}

 
export function requireAdmin(fn: Function) {
   
  return isAuthenticated(async (req: NextRequest, context?: any) => {
     
    const user = (req as any)["user"];

    if (user.role !== UserRole.ADMIN) {
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Admin access required",
        403
      );
    }

    return await fn(req, context);
  });
}

 
export function requireCoach(fn: Function) {
   
  return isAuthenticated(async (req: NextRequest, context?: any) => {
     
    const user = (req as any)["user"];

    if (user.role !== UserRole.COACH) {
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Coach access required",
        403
      );
    }

    return await fn(req, context);
  });
}

 
export function requireStudent(fn: Function) {
   
  return isAuthenticated(async (req: NextRequest, context?: any) => {
     
    const user = (req as any)["user"];

    if (user.role !== UserRole.STUDENT) {
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Student access required",
        403
      );
    }

    return await fn(req, context);
  });
}
