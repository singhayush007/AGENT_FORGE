"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  Delete02Icon,
  Menu01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";

import {
  ChatPanel,
  type ChatMessage,
} from "@/features/playground/components/ChatPanel";
import {
  deleteConversation,
  getConversationMessages,
  listConversations,
} from "@/features/playground/actions/conversation.actions";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "@/shared/components/ui/toast";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

type Agent = {
  id: string;
  name: string;
  icon: string;
  welcomeMessage: string;
  starterPrompts: string[];
};

type ChatSession = { key: string; id?: string; messages: ChatMessage[] };

function HistoryList({
  agentId,
  activeId,
  onSelect,
  onNew,
}: {
  agentId: string;
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["conversations", agentId],
    queryFn: () => listConversations(agentId),
  });

  async function remove(id: string) {
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await deleteConversation(id);
      await queryClient.invalidateQueries({ queryKey: ["conversations", agentId] });
      if (id === activeId) onNew();
    } catch {
      toast.add({ title: "Could not delete conversation", description: "Please try again.", type: "error" });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button className="w-full" variant="outline" onClick={onNew}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          New chat
        </Button>
      </div>
      <p className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        History
      </p>
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {isError ? (
          <div className="px-2 py-6 text-center">
            <p className="text-xs text-muted-foreground">Could not load history.</p>
            <Button variant="outline" size="xs" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))
        ) : (data ?? []).length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          (data ?? []).map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg pr-1 transition-colors",
                c.id === activeId ? "bg-primary/10" : "hover:bg-muted"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="min-w-0 flex-1 px-3 py-2 text-left"
              >
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    c.id === activeId && "text-primary"
                  )}
                >
                  {c.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(c.updatedAt, { addSuffix: true })}
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete conversation"
                className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
                onClick={() => remove(c.id)}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function ChatPage({
  agent,
  initialConversation,
}: {
  agent: Agent;
  initialConversation?: { id: string; messages: ChatMessage[] };
}) {
  const queryClient = useQueryClient();
  const [session, setSession] = React.useState<ChatSession>(
    initialConversation
      ? { key: initialConversation.id, id: initialConversation.id, messages: initialConversation.messages }
      : { key: "new-0", messages: [] }
  );
  const [loading, setLoading] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const counter = React.useRef(0);

  function startNew() {
    counter.current += 1;
    setSession({ key: `new-${counter.current}`, messages: [] });
    setHistoryOpen(false);
  }

  async function open(id: string) {
    setHistoryOpen(false);
    setLoading(true);
    try {
      const messages = await getConversationMessages(id);
      setSession({ key: id, id, messages });
    } catch {
      toast.add({ title: "Could not open that conversation", description: "Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function onSaved(id: string) {
    // Highlight the conversation in the list without remounting the chat.
    setSession((s) => (s.id ? s : { ...s, id }));
    queryClient.invalidateQueries({ queryKey: ["conversations", agent.id] });
  }

  const history = (
    <HistoryList
      agentId={agent.id}
      activeId={session.id}
      onSelect={open}
      onNew={startNew}
    />
  );

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to agents"
            nativeButton={false}
            render={<Link href="/agents" />}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-xl ring-1 ring-primary/10">
            {agent.icon}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-sm font-semibold sm:text-base">
              {agent.name}
            </h1>
            <p className="text-xs text-muted-foreground">Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Chat history"
            onClick={() => setHistoryOpen(true)}
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/agents/${agent.id}/builder`} />}
          >
            <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
            <span className="hidden sm:inline">Edit agent</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-muted/30 md:block">
          {history}
        </aside>

        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Chat history</SheetTitle>
            {history}
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="size-5" />
            </div>
          ) : (
            <ChatPanel
              key={session.key}
              agentId={agent.id}
              welcomeMessage={agent.welcomeMessage}
              starterPrompts={agent.starterPrompts}
              initialMessages={session.messages}
              initialConversationId={session.id}
              onConversationSaved={onSaved}
              showExport
            />
          )}
        </main>
      </div>
    </div>
  );
}
