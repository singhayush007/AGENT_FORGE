import { z } from "zod";
import { prisma } from "@/shared/lib/db";
import { runAgentStream } from "@/features/runtime/services/runAgent.service";
import { toFriendlyError } from "@/features/runtime/util/friendlyError.utils";
import { isCustomToolConfig } from "@/shared/utils/customTool.utils";
import { loadBuilderDefinition } from "@/shared/utils/workflowMigrate.utils";
import type { BuilderDefinition } from "@/shared/types/workflow.types";

// Public chat endpoint for shared agents. No login, so we are strict:
// - GitHub tools and custom HTTP tools are removed (they use the owner's token / secret headers)
// - per-IP rate limit
// - small inputs
// - nothing is stored; the browser sends the short history each time

const LIMIT = 20; // messages
const WINDOW_MS = 10 * 60 * 1000; // per 10 minutes
const hits = new Map<string, number[]>();

// In-memory on purpose (simple). It resets on restart and is per server instance.
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const bodySchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(20)
    .default([]),
});

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function sanitize(definition: BuilderDefinition): BuilderDefinition {
  return {
    ...definition,
    memory: { enabled: true }, // history comes from the browser
    nodes: definition.nodes.map((n) =>
      n.type === "agent"
        ? {
            ...n,
            config: {
              ...n.config,
              tools: n.config.tools.filter(
                (t) => !t.toolId.startsWith("github_") && !isCustomToolConfig(t.config)
              ),
            },
          }
        : n
    ),
  };
}

// Vercel: allow long-running streamed agent runs (the default serverless timeout is too short).
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

    if (rateLimited(ip)) {
      return jsonError("You are sending messages too fast. Please wait a few minutes.", 429);
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const agent = await prisma.agent.findFirst({ where: { shareId } });
    if (!agent) return jsonError("This shared agent is no longer available.", 404);

    const definition = sanitize(loadBuilderDefinition(agent.draftDefinition));
    const { message, history } = parsed.data;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(data: unknown) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {
            // client left
          }
        }
        try {
          // "public" is not a real user id, so owner-only tools can never resolve a token.
          await runAgentStream(definition, history, message, "public", send);
          send({ type: "run_completed", conversationId: "" });
        } catch (err) {
          send({ type: "run_failed", error: toFriendlyError(err) });
        }
        try {
          controller.close();
        } catch {
          // already closed
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[share runs]", err);
    return jsonError("The server hit a problem. Please try again.", 500);
  }
}
