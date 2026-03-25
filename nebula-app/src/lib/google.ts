import { google, calendar_v3 } from "googleapis";
import { env } from "@/config/env";

/* --- Token Store (Development) --- */

// Simple in-memory token storage (in production, use Redis or database)
const tokenStore = new Map<string, { accessToken: string; refreshToken?: string; expiryDate?: number }>();

export function storeGoogleTokens(userId: string, accessToken: string, refreshToken?: string, expiryDate?: number) {
  tokenStore.set(userId, { accessToken, refreshToken, expiryDate });
}

export function getGoogleTokens(userId: string) {
  return tokenStore.get(userId);
}

export function clearGoogleTokens(userId: string) {
  tokenStore.delete(userId);
}

/* --- Auth Utilities --- */

export function getGoogleAuthUrl() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google credentials");
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/auth/google-calendar`
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events"
    ],
    prompt: "consent"
  });
}

/* --- Calendar Utilities --- */

export async function createCalendarEvent(
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  attendees: string[],
  accessToken: string,
  refreshToken?: string
): Promise<{ meetLink: string; eventId: string; newAccessToken?: string }> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }

  const auth = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/auth/google-calendar`
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth });

  const event: calendar_v3.Schema$Event = {
    summary: title,
    description: description,
    start: {
      dateTime: startTime,
      timeZone: "UTC",
    },
    end: {
      dateTime: endTime,
      timeZone: "UTC",
    },
    attendees: attendees.map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    const createdEvent = response.data;
    const meetLink =
      createdEvent.hangoutLink ||
      createdEvent.conferenceData?.entryPoints?.[0]?.uri;
    const eventId = createdEvent.id;

    if (!meetLink || !eventId) {
      throw new Error("Failed to create Google Meet link.");
    }

    const credentials = auth.credentials;
    const newAccessToken = credentials.access_token !== accessToken ? credentials.access_token : undefined;

    return {
      meetLink,
      eventId,
      newAccessToken: newAccessToken as string | undefined
    };
  } catch (error: any) {
    if (error.code === 401 && refreshToken) {
      await auth.refreshAccessToken();
      const retryResponse = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
        conferenceDataVersion: 1,
      });
      return {
        meetLink: retryResponse.data.hangoutLink!,
        eventId: retryResponse.data.id!,
        newAccessToken: auth.credentials.access_token as string
      };
    }
    throw new Error("Failed to create Google Calendar event.");
  }
}

export async function updateCalendarEvent(
  eventId: string,
  startTime: string,
  endTime: string,
  accessToken: string,
  refreshToken?: string
): Promise<{ newAccessToken?: string }> {
  const auth = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/auth/google-calendar`
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    await calendar.events.patch({
      calendarId: "primary",
      eventId: eventId,
      requestBody: {
        start: { dateTime: startTime, timeZone: "UTC" },
        end: { dateTime: endTime, timeZone: "UTC" },
      },
    });

    const credentials = auth.credentials;
    const newAccessToken = credentials.access_token !== accessToken ? credentials.access_token : undefined;
    return { newAccessToken: newAccessToken as string | undefined };
  } catch (error: any) {
    if (error.code === 401 && refreshToken) {
      await auth.refreshAccessToken();
      await calendar.events.patch({
        calendarId: "primary",
        eventId: eventId,
        requestBody: {
          start: { dateTime: startTime, timeZone: "UTC" },
          end: { dateTime: endTime, timeZone: "UTC" },
        },
      });
      return { newAccessToken: auth.credentials.access_token as string };
    }
    throw new Error("Failed to update Google Calendar event.");
  }
}

export async function deleteCalendarEvent(
  eventId: string,
  accessToken: string,
  refreshToken?: string
): Promise<{ newAccessToken?: string }> {
  const auth = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/auth/google-calendar`
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    const credentials = auth.credentials;
    const newAccessToken = credentials.access_token !== accessToken ? credentials.access_token : undefined;
    return { newAccessToken: newAccessToken as string | undefined };
  } catch (error: any) {
    if (error.code === 401 && refreshToken) {
      await auth.refreshAccessToken();
      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });
      return { newAccessToken: auth.credentials.access_token as string };
    }
    throw new Error("Failed to delete Google Calendar event.");
  }
}
