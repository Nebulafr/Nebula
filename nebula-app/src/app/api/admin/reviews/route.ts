import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "../../services/admin.service";
import { isAuthenticated } from "../../middleware/auth";
import { adminReviewQuerySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const handler = isAuthenticated(async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const queryParams = {
        search: searchParams.get("search") || undefined,
        targetType: searchParams.get("targetType") || undefined,
        status: searchParams.get("status") || undefined,
        rating: searchParams.get("rating") || undefined,
        page: searchParams.get("page") || undefined,
        limit: searchParams.get("limit") || undefined,
      };

      const validatedParams = adminReviewQuerySchema.parse(queryParams);
      return await AdminService.getReviews(validatedParams as any);
    } catch (error: any) {
      console.error("Admin Reviews API Error:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  });

  return handler(req);
}