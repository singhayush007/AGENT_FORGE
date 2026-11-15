import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const datetimeTool = tool(
  async ({ timezone }) => {
    const tz = timezone || "UTC";
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        dateStyle: "full",
        timeStyle: "long",
      }).format(now);
      return JSON.stringify({ timezone: tz, formatted, iso: now.toISOString() });
    } catch {
      return `Unknown timezone: ${tz}. Use an IANA name like "Asia/Kolkata" or "America/New_York".`;
    }
  },
  {
    name: "current_datetime",
    description: "Get the current date and time, optionally in a specific IANA timezone",
    schema: z.object({
      timezone: z
        .string()
        .optional()
        .describe('IANA timezone, e.g. "Asia/Kolkata". Defaults to UTC.'),
    }),
  }
);
