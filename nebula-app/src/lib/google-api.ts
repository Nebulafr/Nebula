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
 * @returns {Promise<{ meetLink: string; eventId: string }>} - The Google Meet link and the event ID.
 * @throws {Error} - If environment variables are not set or API call fails.
 */

export async function createCalendarEvent(
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  attendees: string[],
  accessToken: string
): Promise<{ meetLink: string; eventId: string }> {
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
    `${process.env.NEXTAUTH_URL}/admin/events`
  );

  // Set the access token
  auth.setCredentials({
    access_token: accessToken,
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

    return { meetLink, eventId };
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    throw new Error("Failed to create Google Calendar event.");
  }
}
