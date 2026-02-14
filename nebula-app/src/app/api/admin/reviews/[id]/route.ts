import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "../../../services/review.service";
import { isAuthenticated } from "../../../middleware/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = isAuthenticated(async (req: NextRequest) => {
    try {
      const { id } = await params;
      return await ReviewService.deleteReview(id);
    } catch (error: any) {
      console.error("Admin Delete Review API Error:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  });

  return handler(req);
}
