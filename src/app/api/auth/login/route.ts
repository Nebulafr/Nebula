import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    const decodedToken = await auth.verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
    }

    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: 5 * 24 * 60 * 60 * 1000,
    });

    const cookieOptions = {
      name: "auth-token",
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 5 * 24 * 60 * 60,
      path: "/",
    };

    cookieStore.set(cookieOptions);

    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        role: decodedToken.role || "student",
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.code === "auth/id-token-expired") {
      return NextResponse.json({ error: "Token has expired" }, { status: 401 });
    }

    if (error.code === "auth/id-token-revoked") {
      return NextResponse.json(
        { error: "Token has been revoked" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
