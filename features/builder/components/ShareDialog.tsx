"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Share08Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { getShareState, setSharing } from "@/features/agents/actions/agent.actions";
import { friendlyMessage } from "@/shared/utils/errors.utils";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Switch } from "@/shared/components/ui/switch";
import { toast } from "@/shared/components/ui/toast";

export function ShareDialog({ agentId }: { agentId: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const queryClient = useQueryClient();
  const key = ["share", agentId];

  const state = useQuery({ queryKey: key, queryFn: () => getShareState(agentId), enabled: open });
  const toggle = useMutation({
    mutationFn: (enabled: boolean) => setSharing(agentId, enabled),
    onSuccess: (data) => queryClient.setQueryData(key, data),
    onError: (e: Error) =>
      toast.add({ title: "Could not update sharing", description: friendlyMessage(e), type: "error" }),
  });

  const shareId = state.data?.shareId ?? null;
  const url = shareId && typeof window !== "undefined" ? `${window.location.origin}/share/${shareId}` : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.add({ title: "Could not copy the link", type: "error" });
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" aria-label="Share" onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Share08Icon} strokeWidth={2} />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this agent</DialogTitle>
            <DialogDescription>
              Anyone with the link can chat with the last saved version. No sign-in needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium">Public link</p>
              <p className="text-xs text-muted-foreground">
                {shareId ? "On: anyone with the link can chat." : "Off: only you can use this agent."}
              </p>
            </div>
            <Switch
              aria-label="Enable public link"
              checked={Boolean(shareId)}
              disabled={state.isLoading || toggle.isPending}
              onCheckedChange={(v) => toggle.mutate(Boolean(v))}
            />
          </div>

          {shareId && (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={url}
                aria-label="Share link"
                onFocus={(e) => e.currentTarget.select()}
                className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-input/30 px-3 text-sm outline-none"
              />
              <Button onClick={copy} variant="outline">
                <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} strokeWidth={2} />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}

          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• GitHub and custom API tools are turned off on shared agents.</li>
            <li>• Visitors are rate-limited, and their chats are not saved.</li>
            <li>• Turning the link off breaks it for good; a new link gets a new address.</li>
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
