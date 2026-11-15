"use client";

import { Handle, Position } from "@xyflow/react";
import { AppIcon } from "@/shared/components/AppIcon";

export function StartNode() {
  return (
    <div className="min-w-[140px] rounded-2xl border border-emerald-500/40 bg-card px-4 py-3.5 shadow-md ring-1 ring-emerald-500/10">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <AppIcon name="play" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">Start</p>
          <p className="text-xs text-muted-foreground">User message in</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}
