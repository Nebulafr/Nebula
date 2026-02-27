import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from "@/lib/auth-storage";

 
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all auth-related cookies
    cookieStore.delete(AUTH_TOKEN_KEY);
    cookieStore.delete(USER_DATA_KEY);
    cookieStore.delete("auth-token"); // legacy cleanup
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
