"use server";
/**
 * @fileoverview Service for interacting with Google APIs, specifically Google Calendar.
 */

import { google, calendar_v3 } from "googleapis";

/**
 * Creates a Google Calendar event with a Google Meet link.
 * @param {string} title - The title of the event.
 * @param {string} description - The description of the event.
 * @param {string} startTime - The start time of the event in ISO 8601 format.
 * @param {string} endTime - The end time of the event in ISO 8601 format.
 * @param {string[]} attendees - An array of attendee email addresses.
 * @returns {Promise<{ meetLink: string; eventId: string }>} - The Google Meet link and the event ID.
 * @throws {Error} - If environment variables are not set or API call fails.
 */

export async function createCalendarEvent(
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  attendees: string[]
): Promise<{ meetLink: string; eventId: string }> {
  // Check for required environment variables
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN must be set in environment variables"
    );
  }

  // Create OAuth2 client
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  // Set refresh token
  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
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
        requestId: `nebula-${Date.now()}`,
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
