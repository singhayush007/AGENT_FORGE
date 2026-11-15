"use client";

import { Handle, Position } from "@xyflow/react";
import { AppIcon } from "@/shared/components/AppIcon";

export function EndNode() {
  return (
    <div className="min-w-[140px] rounded-2xl border border-rose-500/40 bg-card px-4 py-3.5 shadow-md ring-1 ring-rose-500/10">
      <Handle type="target" position={Position.Top} id="top" />
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10">
          <AppIcon name="flag" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">End</p>
          <p className="text-xs text-muted-foreground">Final response</p>
        </div>
      </div>
    </div>
  );
}
