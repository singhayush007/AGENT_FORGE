import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/shared/lib/db";
import type { Prisma } from "@/shared/lib/generated/prisma/client";
import { auth } from "@/shared/lib/auth";
import { runAgentStream } from "@/features/runtime/services/runAgent.service";
import { builderDefinitionSchema } from "@/shared/types/workflow.types";
import { toFriendlyError } from "@/features/runtime/util/friendlyError.utils";
import { loadBuilderDefinition } from "@/shared/utils/workflowMigrate.utils";

// What the chat panel sends us. `definition` is the (maybe unsaved) canvas.
// If it is missing we fall back to the agent's saved draft.
function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const runRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty"),
  conversationId: z.string().optional(),
  // Re-run the last user message and replace the last assistant reply.
  regenerate: z.boolean().optional(),
  definition: builderDefinitionSchema.optional(),
});

async function handle(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return jsonError("Your session expired. Please sign in again.", 401);
  }

  const { agentId } = await params;

  const parsed = runRequestSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  const { conversationId, regenerate } = parsed.data;
  let message = parsed.data.message;

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  });

  if (!agent) {
    return jsonError("This agent no longer exists.", 404);
  }

  const definition =
    parsed.data.definition ?? loadBuilderDefinition(agent.draftDefinition);

  let conversation = conversationId
    ? await prisma.conversation.findFirst({
        where: { id: conversationId, userId: session.user.id, agentId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        agentId,
        title: message.slice(0, 60),
      },
      include: { messages: true },
    });
  }

  const conversationIdToUse = conversation.id;

  let priorMessages = conversation.messages;

  if (regenerate) {
    const last = priorMessages[priorMessages.length - 1];
    const beforeLast = priorMessages[priorMessages.length - 2];

    // Normal case: [user, assistant]. Failed run: the list ends with the user message.
    const dropIds: string[] = [];
    let userMsg: (typeof priorMessages)[number] | undefined;

    if (last?.role === "assistant" && beforeLast?.role === "user") {
      dropIds.push(last.id, beforeLast.id);
      userMsg = beforeLast;
    } else if (last?.role === "user") {
      dropIds.push(last.id);
      userMsg = last;
    }

    if (!userMsg) {
      return jsonError("Nothing to regenerate yet.", 400);
    }

    await prisma.message.deleteMany({ where: { id: { in: dropIds } } });
    message = userMsg.content;
    priorMessages = priorMessages.filter((m) => !dropIds.includes(m.id));
  }

  const history = priorMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  await prisma.message.create({
    data: {
      conversationId: conversationIdToUse,
      role: "user",
      content: message,
    },
  });

  const toolEvents: { tool: string; status: string; input?: unknown; output?: string }[] = [];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        // The browser may have closed the stream (Stop button / tab closed).
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // ignore: nobody is listening anymore
        }
      }

      try {
        const assistantText = await runAgentStream(
          definition,
          history,
          message,
          session.user.id,
          (event) => {
            if (event.type === "tool_started") {
              toolEvents.push({ tool: event.tool, input: event.input, status: "started" });
            }
            if (event.type === "tool_completed") {
              toolEvents.push({ tool: event.tool, output: event.output, status: "completed" });
            }
            send(event);
          },
        );

        await prisma.message.create({
          data: {
            conversationId: conversationIdToUse,
            role: "assistant",
            content: assistantText || "No response",
            toolEvents: toolEvents as Prisma.InputJsonValue,
          },
        });

        send({ type: "run_completed", conversationId: conversationIdToUse });
      } catch (err) {
        const error = toFriendlyError(err);
        send({ type: "run_failed", error, conversationId: conversationIdToUse });
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
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ agentId: string }> },
) {
  try {
    return await handle(req, ctx);
  } catch (err) {
    // Database or other unexpected failures before the stream starts.
    console.error("[runs route]", err);
    return jsonError("The server hit a problem. Please try again.", 500);
  }
}
