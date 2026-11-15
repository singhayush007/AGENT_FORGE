import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/db";
import { PublicChatPage } from "@/features/playground/views/PublicChatPage";

// Public page: anyone with the link can chat. Only safe fields are read.
async function getSharedAgent(shareId: string) {
  return prisma.agent.findFirst({
    where: { shareId },
    select: { name: true, description: true, icon: true, welcomeMessage: true, starterPrompts: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const agent = await getSharedAgent((await params).shareId);
  return { title: agent ? `${agent.name} · AgentForge` : "AgentForge" };
}

export default async function SharedAgentPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const agent = await getSharedAgent(shareId);

  if (!agent) notFound();

  return (
    <PublicChatPage
      shareId={shareId}
      agent={{
        name: agent.name,
        description: agent.description,
        icon: agent.icon,
        welcomeMessage: agent.welcomeMessage,
        starterPrompts: Array.isArray(agent.starterPrompts) ? (agent.starterPrompts as string[]) : [],
      }}
    />
  );
}
