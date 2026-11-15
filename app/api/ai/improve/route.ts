import { headers } from "next/headers";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { auth } from "@/shared/lib/auth";
import { toFriendlyError } from "@/features/runtime/util/friendlyError.utils";

const bodySchema = z.object({
  instructions: z.string().trim().min(1, "Write some instructions first").max(4000),
  agentName: z.string().max(120).optional(),
  tools: z.array(z.string().max(60)).max(20).optional(),
});

const SYSTEM = `You improve system prompts for AI agents.
Rewrite the user's instructions so they are clear, specific and well structured:
- one short line stating the agent's role
- bullet points for behaviour rules (tone, format, what to avoid)
- when to use each available tool, if tools are listed
Keep the original intent. Do not invent capabilities the agent does not have.
Return ONLY the improved instructions as plain text. No preamble, no code fences.`;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

// Vercel: allow long-running streamed agent runs (the default serverless timeout is too short).
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return jsonError("Your session expired. Please sign in again.", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return jsonError("The AI provider key is missing. Add OPENAI_API_KEY to .env.", 500);

  const { instructions, agentName, tools } = parsed.data;

  try {
    const model = new ChatOpenAI({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      apiKey,
      temperature: 0.4,
      configuration: process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : undefined,
    });

    const context = [
      agentName ? `Agent name: ${agentName}` : "",
      tools?.length ? `Available tools: ${tools.join(", ")}` : "Available tools: none",
      `Current instructions:\n${instructions}`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await model.invoke([
      { role: "system", content: SYSTEM },
      { role: "user", content: context },
    ]);

    const text = (typeof res.content === "string" ? res.content : "").trim();
    if (!text) return jsonError("The AI returned an empty answer. Please try again.", 502);

    return Response.json({ instructions: text.slice(0, 4000) });
  } catch (err) {
    return jsonError(toFriendlyError(err), 502);
  }
}
