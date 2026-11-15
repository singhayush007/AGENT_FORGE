"use client";

import { CustomToolSettings } from "@/features/builder/components/CustomToolSettings";
import { GithubSettings } from "@/features/builder/components/GithubSettings";
import type { GithubConfig } from "@/shared/types/agentDefinition.types";
import { isCustomToolConfig } from "@/shared/utils/customTool.utils";
import { popularGptModels } from "@/features/builder/constants/models.constants";
import { getToolLabel } from "@/shared/utils/tools.utils";
import { useCanvasStore } from "@/features/builder/store/canvasStore";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "@/shared/components/ui/toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon } from "@hugeicons/core-free-icons";
import * as React from "react";

type ToolEntry = { toolId: string; config: Record<string, unknown> };

export function NodeSettingsPanel() {
  const nodes = useCanvasStore((s) => s.nodes);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const selectedToolIndex = useCanvasStore((s) => s.selectedToolIndex);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const removeTool = useCanvasStore((s) => s.removeTool);
  const updateTool = useCanvasStore((s) => s.updateTool);
  const selectTool = useCanvasStore((s) => s.selectTool);
  const memoryEnabled = useCanvasStore((s) => s.memoryEnabled);
  const toggleMemory = useCanvasStore((s) => s.toggleMemory);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const agentNode = nodes.find((n) => n.type === "agent");

  // "Improve with AI": rewrites the instructions, and we keep the old text for Undo.
  const [improving, setImproving] = React.useState(false);
  const [previous, setPrevious] = React.useState<string | null>(null);

  async function improve(nodeId: string, current: string, name: string, toolIds: string[]) {
    setImproving(true);
    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: current,
          agentName: name,
          tools: toolIds.map((id) => getToolLabel(id)),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.instructions) {
        throw new Error(data?.error ?? "Could not improve the instructions.");
      }
      setPrevious(current);
      updateNodeData(nodeId, { instructions: data.instructions });
      toast.add({ title: "Instructions improved", description: "You can undo this.", type: "success" });
    } catch (e) {
      toast.add({
        title: "Could not improve instructions",
        description: e instanceof Error ? e.message : "Please try again.",
        type: "error",
      });
    } finally {
      setImproving(false);
    }
  }

  if (selectedToolIndex !== null && agentNode) {
    const tools = (agentNode.data.tools as ToolEntry[]) ?? [];
    const tool = tools[selectedToolIndex];

    if (tool && isCustomToolConfig(tool.config)) {
      return (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => selectTool(null)}>
            ← Back to agent
          </Button>
          <h3 className="text-sm font-medium">Custom tool</h3>
          <CustomToolSettings
            config={tool.config}
            onChange={(config) => updateTool(selectedToolIndex, config)}
            onRemove={() => removeTool(selectedToolIndex)}
          />
        </div>
      );
    }
  }

  if (!selectedNode) {
    return (
      <p className="text-muted-foreground text-sm">
        Click Start, Agent, or End on the canvas to edit settings.
      </p>
    );
  }

  if (selectedNode.type === "start") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Start node</h3>
        <p className="text-muted-foreground text-sm">
          Entry point for each user message. Execution flows to the connected Agent node.
        </p>
      </div>
    );
  }

  if (selectedNode.type === "end") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">End node</h3>
        <p className="text-muted-foreground text-sm">
          Final output returned to the user after the Agent finishes.
        </p>
      </div>
    );
  }

  if (selectedNode.type === "agent") {
    const github = (selectedNode.data.github as GithubConfig) ?? {
      owner: "",
      repo: "",
      defaultPrNumber: "",
    };
    const modelId = (selectedNode.data.modelId as string) ?? "gpt-4o-mini";
    const tools = (selectedNode.data.tools as ToolEntry[]) ?? [];

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Agent</h3>

        <div className="space-y-2">
          <Label htmlFor="agent-label">Label</Label>
          <Input
            id="agent-label"
            defaultValue={(selectedNode.data.label as string) ?? "Main agent"}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="instructions">Instructions</Label>
            <div className="flex items-center gap-1">
              {previous !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    updateNodeData(selectedNode.id, { instructions: previous });
                    setPrevious(null);
                  }}
                >
                  Undo
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={improving || !((selectedNode.data.instructions as string) ?? "").trim()}
                onClick={() =>
                  improve(
                    selectedNode.id,
                    (selectedNode.data.instructions as string) ?? "",
                    (selectedNode.data.label as string) ?? "",
                    ((selectedNode.data.tools as { toolId: string }[]) ?? []).map((t) => t.toolId)
                  )
                }
              >
                {improving ? <Spinner className="size-3" /> : <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} />}
                Improve with AI
              </Button>
            </div>
          </div>
          <Textarea
            id="instructions"
            rows={8}
            value={(selectedNode.data.instructions as string) ?? ""}
            onChange={(e) => updateNodeData(selectedNode.id, { instructions: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model ID</Label>
          <Input
            id="model"
            value={modelId}
            placeholder="gpt-4o-mini"
            onChange={(e) => updateNodeData(selectedNode.id, { modelId: e.target.value })}
          />
          <div className="flex flex-wrap gap-1.5">
            {popularGptModels.map((model) => (
              <Button
                key={model}
                type="button"
                variant={modelId === model ? "default" : "outline"}
                size="xs"
                onClick={() => updateNodeData(selectedNode.id, { modelId: model })}
              >
                {model}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tools ({tools.length})</Label>
          <p className="text-muted-foreground text-xs">
            Add tools from the Tools drawer. Click a custom tool to edit it.
          </p>
          {tools.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tools yet.</p>
          ) : (
            <div className="space-y-1">
              {tools.map((tool, i) => (
                <div
                  key={`${tool.toolId}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <button
                    type="button"
                    className="text-left text-sm hover:underline"
                    onClick={() => {
                      if (isCustomToolConfig(tool.config)) selectTool(i);
                    }}
                  >
                    {getToolLabel(tool.toolId, tool.config)}
                  </button>
                  <Button variant="ghost" size="xs" onClick={() => removeTool(i)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Memory</Label>
          <Button variant="outline" size="sm" onClick={toggleMemory}>
            {memoryEnabled ? "Disable memory" : "Enable memory"}
          </Button>
        </div>

        <GithubSettings nodeId={selectedNode.id} github={github} />
      </div>
    );
  }

  return null;
}
