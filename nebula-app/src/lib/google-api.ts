"use server";
/**
 * @fileoverview Service for interacting with Google APIs, specifically Google Calendar.
 */

import { google, calendar_v3 } from "googleapis";
import "dotenv/config";

/**
 * Creates a Google Calendar event with a Google Meet link.
 * @param {string} title - The title of the event.
 * @param {string} description - The description of the event.
 * @param {string} startTime - The start time of the event in ISO 8601 format.
 * @param {string} endTime - The end time of the event in ISO 8601 format.
 * @param {string[]} attendees - An array of attendee email addresses.
 * @param {string} accessToken - Google OAuth2 access token.
 * @param {string} refreshToken - Google OAuth2 refresh token (optional).
 * @returns {Promise<{ meetLink: string; eventId: string; newAccessToken?: string }>} - The Google Meet link, event ID, and optionally a new access token.
 * @throws {Error} - If environment variables are not set or API call fails.
 */

export async function createCalendarEvent(
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  attendees: string[],
  accessToken: string,
  refreshToken?: string
): Promise<{ meetLink: string; eventId: string; newAccessToken?: string }> {
  // Check for required environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables"
    );
  }

  // Create OAuth2 client credentials
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/coach-dashboard`
  );

  // Set the credentials
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Set up automatic token refresh
  auth.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.log('Refresh token received:', tokens.refresh_token);
    }
    if (tokens.access_token) {
      console.log('New access token received');
    }
  });

  // Create calendar client with authentication
  const calendar = google.calendar({ version: "v3", auth });

  // Define the event with proper typing
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
      throw new Error("Failed to create Google Meet link for the event.");
    }

    // Check if we got new credentials (after refresh)
    const credentials = auth.credentials;
    const newAccessToken = credentials.access_token !== accessToken ? credentials.access_token : undefined;

    return { 
      meetLink, 
      eventId,
      newAccessToken: newAccessToken as string | undefined
    };
  } catch (error: any) {
    console.error("Error creating Google Calendar event:", error);
    
    // If it's an auth error and we have a refresh token, try to get new credentials
    if (error.code === 401 && refreshToken) {
      try {
        console.log("Access token expired, attempting to refresh...");
        await auth.refreshAccessToken();
        
        // Retry the calendar event creation with new credentials
        const retryResponse = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
          conferenceDataVersion: 1,
        });

        const retryEvent = retryResponse.data;
        const retryMeetLink =
          retryEvent.hangoutLink ||
          retryEvent.conferenceData?.entryPoints?.[0]?.uri;
        const retryEventId = retryEvent.id;

        if (!retryMeetLink || !retryEventId) {
          throw new Error("Failed to create Google Meet link for the event after token refresh.");
        }

        const newCredentials = auth.credentials;
        return { 
          meetLink: retryMeetLink, 
          eventId: retryEventId,
          newAccessToken: newCredentials.access_token as string
        };
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        throw new Error("Google Calendar access token expired and refresh failed. Please reconnect your calendar.");
      }
    }
    
    throw new Error("Failed to create Google Calendar event.");
  }
}
