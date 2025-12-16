const { createCalendarEvent } = require("./src/lib/google-api.ts");

// Test the Google Calendar API with service account
async function testGoogleCalendar() {
  try {
    console.log("Testing Google Calendar API with service account...");

    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

    const result = await createCalendarEvent(
      "Test Nebula Webinar",
      "This is a test webinar created via API",
      startTime,
      endTime,
      ["test@example.com"]
    );

    console.log("✅ Successfully created calendar event:", result);
    console.log("Meet Link:", result.meetLink);
    console.log("Event ID:", result.eventId);
  } catch (error) {
    console.error("❌ Error testing Google Calendar API:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
  }
}

testGoogleCalendar();
