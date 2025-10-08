import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { google } from "googleapis";
import { z } from "zod";

dotenv.config();

// create new mcp server
const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

//tool function
async function getMyCalendarDataByDate(date) {
  // Initialize the Google Calendar API
  const calendar = google.calendar({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
  });

  //calculate start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  try {
    // Fetch events from Google Calendar
    const res = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items || [];

    // Process and format the event data
    const eventData = events.map((event) => {
      const start = event.start.dateTime || event.start.date;
      const end = event.end.dateTime || event.end.date;
      return {
        summary: event.summary,
        start,
        end,
        description: event.description || "No description",
        location: event.location || "No location",
      };
    });
    if (eventData.length > 0) {
      return eventData;
    } else {
      return "No events found for this date";
    }
  } catch (error) {
    return { error: error.message || "Error fetching calendar data" };
  }
}

//register the tool to mcp
server.tool(
  "getMyCalendarDataByDate",
  {
    description: "Get the calendar data for a given date",
    parameters: z.object({
      date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message:
          "Invalid date format. Please provide a valid date string like 'YYYY-MM-DD'.",
      }),
    }),
  },
  async ({ date }) => {
    console.log(`[MCP-Server] Received request for date: ${date}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(await getMyCalendarDataByDate(date)),
        },
      ],
    };
  }
);

//set transport
async function init() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

//call the initialization function
init();
