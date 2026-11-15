"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/shared/components/AppIcon";
import { isCustomToolConfig } from "@/shared/utils/customTool.utils";
import { getToolIcon, getToolLabel } from "@/shared/utils/tools.utils";
import { useCanvasStore } from "@/features/builder/store/canvasStore";

type ToolEntry = { toolId: string; config?: unknown };

export function AgentNode({ id, data }: NodeProps) {
  const selectNode = useCanvasStore((s) => s.selectNode);
  const selectTool = useCanvasStore((s) => s.selectTool);
  const tools = (data.tools as ToolEntry[] | undefined) ?? [];

  return (
    <div className="min-w-[200px] max-w-[260px] rounded-2xl border border-brand/40 bg-card px-4 py-3.5 shadow-lg shadow-brand/10 ring-1 ring-brand/10">
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10">
          <AppIcon name="bot" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">Agent</p>
          <p className="text-xs text-muted-foreground">{(data.label as string) ?? "Main agent"}</p>
        </div>
      </div>
      {tools.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tools.map((tool, index) => (
            <button
              key={`${tool.toolId}-${index}`}
              type="button"
              className="nodrag nopan inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] leading-tight text-foreground transition-colors hover:bg-muted"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                if (isCustomToolConfig(tool.config)) {
                  selectTool(index);
                  return;
                }
                selectNode(id);
              }}
            >
              <AppIcon name={getToolIcon(tool.toolId, tool.config)} className="size-3" />
              {getToolLabel(tool.toolId, tool.config)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
