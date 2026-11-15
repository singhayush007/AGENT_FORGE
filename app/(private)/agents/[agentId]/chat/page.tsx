import { notFound } from "next/navigation";
import { fetchAgent } from "@/features/agents/actions/agent.actions";
import { getConversationMessages } from "@/features/playground/actions/conversation.actions";
import { ChatPage } from "@/features/playground/views/ChatPage";

export default async function AgentChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ agentId: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { agentId } = await params;
  const { c } = await searchParams;
  const agent = await fetchAgent(agentId);

  if (!agent) notFound();

  const initialMessages = c ? await getConversationMessages(c) : [];

  return (
    <ChatPage
      agent={{
        id: agent.id,
        name: agent.name,
        icon: agent.icon,
        welcomeMessage: agent.welcomeMessage,
        starterPrompts: Array.isArray(agent.starterPrompts)
          ? (agent.starterPrompts as string[])
          : [],
      }}
      initialConversation={
        c && initialMessages.length > 0 ? { id: c, messages: initialMessages } : undefined
      }
    />
  );
}
