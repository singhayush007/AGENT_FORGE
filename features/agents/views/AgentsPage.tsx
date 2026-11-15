"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  BotIcon,
  Clock01Icon,
  Upload01Icon,
  Search01Icon,
  Message01Icon,
  MessageMultiple01Icon,
} from "@hugeicons/core-free-icons";

import { AgentCard } from "@/features/agents/components/AgentCard";
import { useAgents, useImportAgent } from "@/features/agents/hooks/UseAgents";
import { formatDistanceToNow } from "date-fns";
import { listRecentConversations } from "@/features/playground/actions/conversation.actions";
import { toast } from "@/shared/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { getUsageStats } from "@/features/playground/actions/conversation.actions";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { ErrorState } from "@/shared/components/ErrorState";
import { Skeleton } from "@/shared/components/ui/skeleton";

const WEEK = 7 * 24 * 60 * 60 * 1000;

function Stat({
  icon,
  label,
  value,
}: {
  icon: typeof BotIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
      </span>
      <div>
        <p className="font-heading text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function CreateButton({ className }: { className?: string }) {
  return (
    <Button
      className={className}
      render={<Link href="/agents/new" />}
      nativeButton={false}
    >
      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
      Create agent
    </Button>
  );
}

export function AgentsPage() {
  const { data: agents, isLoading, isError, refetch } = useAgents();
  const usage = useQuery({ queryKey: ["usage-stats"], queryFn: getUsageStats });
  const recent = useQuery({ queryKey: ["recent-conversations"], queryFn: listRecentConversations });
  const importAgent = useImportAgent();
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      importAgent.mutate(JSON.parse(await file.text()));
    } catch {
      toast.add({ title: "That file is not valid JSON", type: "error" });
    }
  }

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"recent" | "name">("recent");
  const [now] = React.useState(() => Date.now());

  const list = React.useMemo(() => agents ?? [], [agents]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? list.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            (a.description ?? "").toLowerCase().includes(q)
        )
      : list;
    // The server already sorts pinned-first by recent. "A-Z" keeps pinned on top too.
    return sort === "name"
      ? [...matches].sort(
          (a, b) => Number(b.pinned) - Number(a.pinned) || a.name.localeCompare(b.name)
        )
      : matches;
  }, [list, query, sort]);

  const editedThisWeek = list.filter(
    (a) => now - new Date(a.updatedAt).getTime() < WEEK
  ).length;

  return (
    <>
      <PageHeader
        title="My Agents"
        description="Create, test and manage your AI agents."
        action={
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={onFile}
            />
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              disabled={importAgent.isPending}
              onClick={() => fileRef.current?.click()}
            >
              <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} />
              Import
            </Button>
            <CreateButton className="flex-1 sm:flex-none" />
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={BotIcon} label="Total agents" value={isLoading ? "–" : list.length} />
        <Stat icon={Clock01Icon} label="Edited this week" value={isLoading ? "–" : editedThisWeek} />
        <Stat icon={MessageMultiple01Icon} label="Conversations" value={usage.data?.conversations ?? "–"} />
        <Stat icon={Message01Icon} label="Messages" value={usage.data?.messages ?? "–"} />
      </div>

      {isError ? (
        <ErrorState
          title="Could not load your agents"
          description="The server did not respond. Check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={BotIcon} strokeWidth={2} className="size-7" />
          </span>
          <h2 className="font-heading text-xl font-semibold">No agents yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Pick a ready-made template or start from a blank canvas. You can
            add tools any time.
          </p>
          <CreateButton className="mt-6" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents..."
                aria-label="Search agents"
              />
            </InputGroup>
          </div>
          <div
            role="tablist"
            aria-label="Sort agents"
            className="inline-flex w-fit rounded-full border border-border bg-card p-0.5 text-sm"
          >
            {(
              [
                ["recent", "Recent"],
                ["name", "A–Z"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={sort === value}
                onClick={() => setSort(value)}
                className={
                  "rounded-full px-3.5 py-1 font-medium transition-colors " +
                  (sort === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {label}
              </button>
            ))}
          </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No agents match &quot;{query}&quot;.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </>
      )}

      {(recent.data ?? []).length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 font-heading text-lg font-semibold">Recent conversations</h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {(recent.data ?? []).map((c) => (
              <Link
                key={c.id}
                href={`/agents/${c.agent.id}/chat?c=${c.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                  {c.agent.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.agent.name}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(c.updatedAt, { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}