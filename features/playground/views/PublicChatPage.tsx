"use client";

import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import { ModeToggle } from "@/shared/components/ui/mode-toggle";
import { ChatPanel } from "@/features/playground/components/ChatPanel";

type Agent = {
  name: string;
  description: string;
  icon: string;
  welcomeMessage: string;
  starterPrompts: string[];
};

export function PublicChatPage({ shareId, agent }: { shareId: string; agent: Agent }) {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-2xl ring-1 ring-primary/10">
            {agent.icon}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-base font-semibold">{agent.name}</h1>
            {agent.description && (
              <p className="truncate text-xs text-muted-foreground">{agent.description}</p>
            )}
          </div>
        </div>
        <ModeToggle />
      </header>

      <main className="min-h-0 flex-1">
        <ChatPanel
          agentId={shareId}
          welcomeMessage={agent.welcomeMessage}
          starterPrompts={agent.starterPrompts}
          stateless
          runUrl={`/api/share/${shareId}/runs`}
        />
      </main>

      <footer className="flex items-center justify-center gap-2 border-t border-border py-2 text-xs text-muted-foreground">
        Built with
        <Link href="/" className="font-medium text-foreground hover:underline">
          <Logo showLabel={false} href="/" className="[&_img]:size-4" />
        </Link>
        <Link href="/" className="font-medium text-foreground hover:underline">AgentForge</Link>
      </footer>
    </div>
  );
}
