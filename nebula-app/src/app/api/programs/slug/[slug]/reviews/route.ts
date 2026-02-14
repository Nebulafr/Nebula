import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "../../../../services/review.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);

    const sortOptions = {
      sortBy: (searchParams.get("sortBy") || "recent") as any,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    };

    return await ReviewService.getReviewsBySlug("PROGRAM", slug, sortOptions);
  } catch (error: any) {
    console.error("Reviews API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: error.statusCode || 500 }
    );
  }
}
