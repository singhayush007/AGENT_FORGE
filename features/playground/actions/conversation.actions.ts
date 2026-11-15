"use server";

import { prisma } from "@/shared/lib/db";
import { requireAuth } from "@/features/auth/actions/auth.actions";

export async function listConversations(agentId: string) {
  const session = await requireAuth();

  return prisma.conversation.findMany({
    where: { agentId, userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
    take: 100,
  });
}

export async function getConversationMessages(conversationId: string) {
  const session = await requireAuth();

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) return [];

  return conversation.messages.map((m) => {
    // toolEvents is a flat list of started/completed events. Pair them by order per tool.
    const events = Array.isArray(m.toolEvents)
      ? (m.toolEvents as { tool: string; status: string; input?: unknown; output?: string }[])
      : [];
    const tools: { tool: string; status: "done"; input?: unknown; output?: string }[] = [];
    for (const e of events) {
      if (e.status === "started") {
        tools.push({ tool: e.tool, status: "done", input: e.input });
      } else if (e.status === "completed") {
        const open = tools.find((t) => t.tool === e.tool && t.output === undefined);
        if (open) open.output = e.output;
      }
    }

    return {
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
      tools,
    };
  });
}

export async function deleteConversation(conversationId: string) {
  const session = await requireAuth();

  await prisma.conversation.deleteMany({
    where: { id: conversationId, userId: session.user.id },
  });
}

export async function getUsageStats() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [conversations, messages] = await Promise.all([
    prisma.conversation.count({ where: { userId } }),
    prisma.message.count({ where: { conversation: { userId } } }),
  ]);

  return { conversations, messages };
}

export async function listRecentConversations() {
  const session = await requireAuth();

  return prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      agent: { select: { id: true, name: true, icon: true } },
    },
  });
}
