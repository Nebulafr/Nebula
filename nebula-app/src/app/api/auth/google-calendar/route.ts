import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { EventType } from "@/types/event";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const eventType = searchParams.get("eventType");
  const step = searchParams.get("step");

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Missing Google credentials" },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/google-calendar`
  );

  if (!code) {
    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google-calendar`,
    });

    console.log({
      authUrl,
      url: `${process.env.NEXTAUTH_URL}/api/auth/google-calendar`,
    });

    return NextResponse.redirect(authUrl);
  }

  try {
    // Exchange authorization code for access token
    const { tokens } = await oauth2Client.getToken(code);

    // Parse state to get eventType and step
    const state = searchParams.get("state");
    const stateData = state ? JSON.parse(state) : {};

    // Redirect back to admin events page with access token and form state
    const redirectUrl = new URL("/admin/events", process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("access_token", tokens.access_token || "");
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set("refresh_token", tokens.refresh_token);
    }
    // Always redirect to WEBINAR step 2 after Google auth
    redirectUrl.searchParams.set("eventType", EventType.WEBINAR);
    redirectUrl.searchParams.set("step", "2");

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Failed to get access token" },
      { status: 500 }
    );
  }
}
