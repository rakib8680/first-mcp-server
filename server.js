import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dotenv from "dotenv";
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
        version:'v3',
        auth: process.env.GOOGLE_API_KEY
    })
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
