"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { AgentNode } from "@/features/builder/components/nodes/AgentNode";
import { EndNode } from "@/features/builder/components/nodes/EndNode";
import { StartNode } from "@/features/builder/components/nodes/StartNode";
import { useCanvasStore } from "@/features/builder/store/canvasStore";

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  start: StartNode,
  end: EndNode,
};

export function AgentCanvas() {
  const { resolvedTheme } = useTheme();
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const selectNode = useCanvasStore((s) => s.selectNode);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        <Controls showInteractive={false} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm [&_button]:border-border [&_button]:bg-card [&_button]:fill-foreground [&_button:hover]:bg-muted" />
        <MiniMap
          maskColor="transparent"
          nodeStrokeWidth={3}
          pannable
          zoomable
          className="!hidden overflow-hidden rounded-xl border border-border !bg-card shadow-sm md:!block"
        />
      </ReactFlow>
    </div>
  );
}
