import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dotenv from "dotenv";
import { google } from "googleapis";
import z from "zod";
import { version } from "zod/v4/core";

dotenv.config();

// create new mcp server
const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

//tool function
async function getMyCalendarDataByDate(date) {
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
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items || [];

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
    date: z.string(),
    refine:
      ((date) => !isNaN(Date.parse(date)),
      {
        message: "Invalid date format, Please provide a valid date string",
      }),
  },
  async ({ date }) => {
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
