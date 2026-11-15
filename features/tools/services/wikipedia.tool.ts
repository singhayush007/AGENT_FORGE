import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const wikipediaTool = tool(
  async ({ query }) => {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`
    );
    const search = await searchRes.json();
    const title: string | undefined = search?.query?.search?.[0]?.title;

    if (!title) return `No Wikipedia article found for "${query}".`;

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );
    if (!summaryRes.ok) return `Could not load the Wikipedia article "${title}".`;
    const summary = await summaryRes.json();

    return JSON.stringify({
      title: summary.title,
      description: summary.description,
      extract: summary.extract,
      url: summary.content_urls?.desktop?.page,
    });
  },
  {
    name: "wikipedia",
    description: "Look up a topic on Wikipedia and return a short summary with a link",
    schema: z.object({
      query: z.string().describe("Topic, person, place or concept to look up"),
    }),
  }
);
