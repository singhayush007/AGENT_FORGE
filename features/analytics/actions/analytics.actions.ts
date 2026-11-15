"use server";

import { prisma } from "@/shared/lib/db";
import { requireAuth } from "@/features/auth/actions/auth.actions";

// ---- Analytics -------------------------------------------------------------

const DAYS = 14;

export async function getAnalytics() {
  const session = await requireAuth();
  const userId = session.user.id;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (DAYS - 1));

  const [messages, agents] = await Promise.all([
    prisma.message.findMany({
      where: { conversation: { userId }, createdAt: { gte: start } },
      select: {
        role: true,
        createdAt: true,
        toolEvents: true,
        conversation: { select: { agentId: true } },
      },
      take: 5000,
    }),
    prisma.agent.findMany({ where: { userId }, select: { id: true, name: true, icon: true } }),
  ]);

  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const daily = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      key: key(d),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      questions: 0,
      replies: 0,
    };
  });
  const byKey = new Map(daily.map((d) => [d.key, d]));

  const toolCounts = new Map<string, number>();
  const agentCounts = new Map<string, number>();

  for (const m of messages) {
    const day = byKey.get(key(m.createdAt));
    if (day) {
      if (m.role === "user") day.questions++;
      else day.replies++;
    }

    if (m.role === "user") {
      agentCounts.set(m.conversation.agentId, (agentCounts.get(m.conversation.agentId) ?? 0) + 1);
    } else if (Array.isArray(m.toolEvents)) {
      for (const e of m.toolEvents as { tool?: string; status?: string }[]) {
        if (e?.status === "started" && e.tool) {
          toolCounts.set(e.tool, (toolCounts.get(e.tool) ?? 0) + 1);
        }
      }
    }
  }

  const agentById = new Map(agents.map((a) => [a.id, a]));

  return {
    days: DAYS,
    totalQuestions: daily.reduce((n, d) => n + d.questions, 0),
    totalToolCalls: [...toolCounts.values()].reduce((n, c) => n + c, 0),
    daily: daily.map(({ label, questions, replies }) => ({ label, questions, replies })),
    tools: [...toolCounts.entries()]
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    topAgents: [...agentCounts.entries()]
      .map(([id, count]) => ({
        name: agentById.get(id)?.name ?? "Deleted agent",
        icon: agentById.get(id)?.icon ?? "🤖",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}
