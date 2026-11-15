"use client";

import { useEffect, useRef, useState } from "react";
import { getToolLabel } from "@/shared/utils/tools.utils";
import { streamAgentRun } from "@/features/playground/services/chatStream.service";
import { Button } from "@/shared/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  BotIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Download01Icon,
  RefreshIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { Markdown } from "@/features/playground/components/Markdown";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/lib/utils";
import { Spinner } from "@/shared/components/ui/spinner";

type ToolStatus = {
  tool: string;
  status: "running" | "done";
  input?: unknown;
  output?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  tools?: ToolStatus[];
  isError?: boolean;
};

export function ChatPanel({
  agentId,
  welcomeMessage,
  starterPrompts,
  initialMessages,
  initialConversationId,
  onConversationSaved,
  getDefinition,
  showExport = false,
  runUrl,
  stateless = false,
}: {
  agentId: string;
  welcomeMessage?: string;
  starterPrompts?: string[];
  initialMessages?: ChatMessage[];
  initialConversationId?: string;
  // Called after each finished reply so a history list can refresh.
  onConversationSaved?: (conversationId: string) => void;
  // Builder passes the live (maybe unsaved) canvas so the test uses your latest changes.
  // Without it the server uses the saved agent.
  getDefinition?: () => unknown;
  // Show the "Export" button (full chat page).
  showExport?: boolean;
  // Public share mode: a different endpoint, and the browser sends the history each time.
  runUrl?: string;
  stateless?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Grow the textarea with its content (up to max-h).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  function exportMarkdown() {
    const md = messages
      .filter((m) => m.content)
      .map((m) => `### ${m.role === "user" ? "You" : "Agent"}\n\n${m.content}`)
      .join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversation.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) sendMessage(lastUser.content, true);
  }

  function stop() {
    abortRef.current?.abort();
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: "Copied to clipboard", type: "success" });
    } catch {
      toast.add({ title: "Could not copy", type: "error" });
    }
  }

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Replace the last message (the assistant reply we are building).
  function updateLastMessage(patch: Partial<ChatMessage>) {
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
      return copy;
    });
  }

  async function sendMessage(text: string, regenerate = false) {
    if (!text.trim() || isRunning) return;

    setInput("");
    setIsRunning(true);
    setMessages((prev) =>
      regenerate
        ? [...prev.slice(0, -1), { role: "assistant", content: "", tools: [] }]
        : [
            ...prev,
            { role: "user", content: text },
            { role: "assistant", content: "", tools: [] },
          ]
    );

    let assistantText = "";
    const tools: ToolStatus[] = [];

    // Read the canvas right now, so the test uses your latest (even unsaved) changes.
    const definition = getDefinition?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const history = stateless
      ? messages
          .filter((m) => m.content && !m.isError)
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }))
      : undefined;

    await streamAgentRun(agentId, { message: text, conversationId, definition, regenerate, history }, (event) => {
      if (event.type === "text_delta") {
        assistantText += event.text;
        updateLastMessage({ content: assistantText });
      }

      if (event.type === "tool_started") {
        tools.push({ tool: event.tool, status: "running", input: event.input });
        updateLastMessage({ tools: [...tools] });
      }

      if (event.type === "tool_completed") {
        const running = tools.find((t) => t.tool === event.tool && t.status === "running");
        if (running) {
          running.status = "done";
          running.output = event.output;
        }
        updateLastMessage({ tools: [...tools] });
      }

      if (event.type === "run_completed") {
        if (event.conversationId) {
          setConversationId(event.conversationId);
          onConversationSaved?.(event.conversationId);
        }
      }

      if (event.type === "run_failed") {
        if (event.conversationId) setConversationId(event.conversationId);
        updateLastMessage({ content: event.error, isError: true });
      }
    }, controller.signal, runUrl);

    abortRef.current = null;
    setIsRunning(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        {showExport && messages.length > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" size="xs" onClick={exportMarkdown}>
              <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
              Export
            </Button>
          </div>
        )}
        {messages.length === 0 && (
          <div className="mx-auto flex max-w-xl flex-col items-center pt-6 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={BotIcon} strokeWidth={2} className="size-6" />
            </span>
            <p className="font-heading text-lg font-semibold">How can I help?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {welcomeMessage || "Send a message to test your agent."}
            </p>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
              {(starterPrompts ?? []).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-xl border border-border bg-card px-3.5 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const isUser = msg.role === "user";

          return (
            <div key={i} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
              {!isUser && (
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HugeiconsIcon icon={BotIcon} strokeWidth={2} className="size-4" />
                </span>
              )}
              <div className={cn("flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]", isUser && "items-end")}>
                {msg.tools && msg.tools.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {msg.tools.map((t, j) => (
                      <details
                        key={j}
                        className="group/tool max-w-full rounded-xl border border-border bg-card text-xs open:shadow-sm"
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground [&::-webkit-details-marker]:hidden">
                          {t.status === "running" ? (
                            <Spinner className="size-3" />
                          ) : (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3 text-emerald-500" />
                          )}
                          <span className="font-medium text-foreground">{getToolLabel(t.tool)}</span>
                          {(t.input !== undefined || t.output) && (
                            <span className="ml-auto text-[10px] group-open/tool:hidden">details</span>
                          )}
                        </summary>
                        <div className="space-y-2 border-t border-border px-2.5 py-2">
                          {t.input !== undefined && (
                            <div>
                              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Input</p>
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-2 font-mono text-[11px]">
                                {JSON.stringify(t.input, null, 2)}
                              </pre>
                            </div>
                          )}
                          {t.output && (
                            <div>
                              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Output</p>
                              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-2 font-mono text-[11px]">
                                {t.output.length > 1500 ? t.output.slice(0, 1500) + "…" : t.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser && "whitespace-pre-wrap",
                    isUser
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : msg.isError
                        ? "rounded-bl-md bg-destructive/10 text-destructive"
                        : "rounded-bl-md bg-muted"
                  )}
                >
                  {!msg.content ? (
                    isRunning && isLast ? <Spinner /> : null
                  ) : isUser || msg.isError ? (
                    msg.content
                  ) : (
                    <Markdown>{msg.content}</Markdown>
                  )}
                </div>
                {!isUser && msg.content && !(isRunning && isLast) && (
                  <div className="flex items-center gap-1">
                    {!msg.isError && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground"
                        onClick={() => copy(msg.content)}
                      >
                        <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                        Copy
                      </Button>
                    )}
                    {isLast && conversationId && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground"
                        onClick={regenerate}
                      >
                        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
                        {msg.isError ? "Retry" : "Regenerate"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!isRunning &&
          conversationId &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
              This message has no reply yet.
              <Button variant="outline" size="xs" onClick={regenerate}>
                <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
                Retry
              </Button>
            </div>
          )}

        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-border bg-background/80 p-3 backdrop-blur sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-input bg-card py-1.5 pl-4 pr-1.5 shadow-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter adds a new line.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Message your agent..."
            title="Enter to send, Shift+Enter for a new line"
            disabled={isRunning}
            aria-label="Message"
            className="max-h-40 min-h-8 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          {isRunning ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="rounded-full"
              aria-label="Stop generating"
              onClick={stop}
            >
              <HugeiconsIcon icon={StopIcon} strokeWidth={2.5} />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="rounded-full"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
