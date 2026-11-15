import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const hackerNewsTool = tool(
  async ({ count }) => {
    const limit = Math.min(Math.max(count ?? 5, 1), 10);
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${limit}`
    );
    if (!res.ok) return "Could not reach Hacker News right now.";
    const data = await res.json();

    const stories = (data.hits ?? []).map(
      (h: { title: string; url?: string; objectID: string; points: number; num_comments: number }) => ({
        title: h.title,
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
        score: h.points,
        comments: h.num_comments,
      })
    );

    return JSON.stringify(stories);
  },
  {
    name: "hacker_news",
    description: "Get the current top stories on Hacker News",
    schema: z.object({
      count: z.number().optional().describe("How many stories (1-10, default 5)"),
    }),
  }
);
