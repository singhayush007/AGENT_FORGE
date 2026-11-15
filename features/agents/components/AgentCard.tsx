"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Message01Icon,
  PinIcon,
} from "@hugeicons/core-free-icons";

import { exportAgent } from "@/features/agents/actions/agent.actions";
import { toast } from "@/shared/components/ui/toast";
import { useDeleteAgent, useDuplicateAgent, useTogglePin } from "@/features/agents/hooks/UseAgents";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

type AgentCardProps = {
  agent: {
    id: string;
    name: string;
    description: string;
    icon: string;
    updatedAt: Date;
    pinned?: boolean;
  };
};

export function AgentCard({ agent }: AgentCardProps) {
  const deleteAgent = useDeleteAgent();
  const duplicateAgent = useDuplicateAgent();
  const togglePin = useTogglePin();
  const href = `/agents/${agent.id}/builder`;

  async function handleExport() {
    try {
      const data = await exportAgent(agent.id);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${agent.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "agent"}.agentforge.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.add({
        title: "Agent exported",
        description: "Custom tool headers are included, so don't share the file publicly.",
        type: "success",
      });
    } catch {
      toast.add({ title: "Could not export agent", type: "error" });
    }
  }

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Whole card is clickable; the delete button sits above it. */}
      <Link href={href} className="absolute inset-0 z-0 rounded-2xl" aria-label={`Open ${agent.name}`} />

      <div className="mb-4 flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-2xl ring-1 ring-primary/10">
          {agent.icon}
        </span>
        <div className="relative z-10 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={agent.pinned ? `Unpin ${agent.name}` : `Pin ${agent.name}`}
            aria-pressed={agent.pinned}
            disabled={togglePin.isPending}
            className={agent.pinned ? "text-primary" : "text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"}
            onClick={() => togglePin.mutate(agent.id)}
          >
            <HugeiconsIcon icon={PinIcon} strokeWidth={2} className={agent.pinned ? "fill-current" : ""} />
          </Button>
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            strokeWidth={2}
            className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>

      <h3 className="font-heading text-base font-semibold leading-tight">{agent.name}</h3>
      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {agent.description || "No description yet"}
      </p>

      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(agent.updatedAt, { addSuffix: true })}
        </p>

        <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Chat with ${agent.name}`}
          className="text-muted-foreground hover:text-primary"
          nativeButton={false}
          render={<Link href={`/agents/${agent.id}/chat`} />}
        >
          <HugeiconsIcon icon={Message01Icon} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Duplicate ${agent.name}`}
          className="text-muted-foreground hover:text-primary"
          disabled={duplicateAgent.isPending}
          onClick={() => duplicateAgent.mutate(agent.id)}
        >
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Export ${agent.name}`}
          className="text-muted-foreground hover:text-primary"
          onClick={handleExport}
        >
          <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${agent.name}`}
                className="text-muted-foreground hover:text-destructive"
              />
            }
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{agent.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes the agent and all its test chats. You can&apos;t undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteAgent.isPending}
                onClick={() => deleteAgent.mutate(agent.id)}
              >
                {deleteAgent.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </div>
  );
}
