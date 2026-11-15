"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSaveAgent } from "@/features/agents/hooks/UseAgents";
import { friendlyMessage } from "@/shared/utils/errors.utils";
import { AgentCanvas } from "@/features/builder/components/AgentCanvas";
import { NodeSettingsPanel } from "@/features/builder/components/NodeSettingsPanel";
import { useCanvasStore } from "@/features/builder/store/canvasStore";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "@/shared/components/ui/toast";
import { ToolPicker } from "@/features/builder/components/ToolPicker";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  FloppyDiskIcon,
  Message01Icon,
  Settings02Icon,
  ToolsIcon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/shared/components/ui/spinner";
import { ShareDialog } from "@/features/builder/components/ShareDialog";
import { ChatPanel } from "@/features/playground/components/ChatPanel";

type AgentBuilderProps = {
  agent: {
    id: string;
    name: string;
    description: string;
    icon: string;
    draftDefinition: unknown;
    canvas: unknown;
    welcomeMessage?: string;
    starterPrompts?: unknown;
  };
};

export function AgentBuilder({ agent }: AgentBuilderProps) {
  const init = useCanvasStore((s) => s.init);
  const isCanvasDirty = useCanvasStore((s) => s.isDirty);
  const settingsOpen = useCanvasStore((s) => s.settingsOpen);
  const setSettingsOpen = useCanvasStore((s) => s.setSettingsOpen);
  const getDefinition = useCanvasStore((s) => s.getDefinition);
  const getCanvas = useCanvasStore((s) => s.getCanvas);
  const markClean = useCanvasStore((s) => s.markClean);

  const saveAgent = useSaveAgent(agent.id);

  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const savedStarters = ((agent.starterPrompts as string[] | undefined) ?? []).join("\n");
  const [welcome, setWelcome] = useState(agent.welcomeMessage ?? "");
  const [starters, setStarters] = useState(savedStarters);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const hasUnsavedChanges =
    isCanvasDirty ||
    name !== agent.name ||
    description !== agent.description ||
    welcome !== (agent.welcomeMessage ?? "") ||
    starters !== savedStarters;

  // Load this agent's saved graph into the canvas.
  // We only re-run this when you open a different agent, not after every save,
  // so your selection and open drawers don't reset.
  useEffect(() => {
    init(agent.draftDefinition, agent.canvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id]);

  // Warn before closing the tab or refreshing with unsaved work.
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  function handleSave() {
    saveAgent.mutate(
      {
        name: name.trim() || "Untitled Agent",
        description,
        welcomeMessage: welcome,
        starterPrompts: starters.split("\n"),
        draftDefinition: getDefinition(),
        canvas: getCanvas(),
      },
      {
        onSuccess: () => {
          markClean();
          toast.add({ title: "Agent saved", type: "success" });
        },
        onError: (error) => {
          toast.add({
            title: "Could not save agent",
            description: friendlyMessage(error),
            type: "error",
          });
        },
      }
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background/80 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="max-sm:size-8"
            aria-label="Back to agents"
            nativeButton={false}
            render={
              <Link
                href="/agents"
                onClick={(event) => {
                  if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Leave anyway?")) {
                    event.preventDefault();
                  }
                }}
              />
            }
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <span className="hidden size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-xl ring-1 ring-primary/10 sm:flex sm:size-10">
            {agent.icon}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-sm font-semibold sm:text-base">
              {name || "Untitled Agent"}
            </h1>
            <p className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
              <span
                className={`size-1.5 rounded-full ${hasUnsavedChanges ? "bg-amber-500" : "bg-emerald-500"}`}
              />
              <span className="sm:hidden">{hasUnsavedChanges ? "Unsaved" : "Saved"}</span>
              <span className="hidden sm:inline">
                {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" className="max-sm:px-2" onClick={() => setToolsOpen(true)} aria-label="Tools">
            <HugeiconsIcon icon={ToolsIcon} strokeWidth={2} />
            <span className="hidden sm:inline">Tools</span>
          </Button>
          <Button variant="outline" size="sm" className="max-sm:px-2" onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <ShareDialog agentId={agent.id} />
          <Button variant="outline" size="sm" className="max-sm:px-2" onClick={() => setChatOpen(true)} aria-label="Test chat">
            <HugeiconsIcon icon={Message01Icon} strokeWidth={2} />
            <span className="hidden sm:inline">Test chat</span>
          </Button>
          <Button size="sm" className="max-sm:px-2" onClick={handleSave} disabled={saveAgent.isPending || !hasUnsavedChanges}>
            {saveAgent.isPending ? <Spinner /> : <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />}
            <span className="hidden sm:inline">{saveAgent.isPending ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 bg-muted/30">
        <AgentCanvas />
      </main>

      {/* Hide the tools drawer while settings are open (e.g. right after adding a custom tool). */}
      <Drawer open={toolsOpen && !settingsOpen} onOpenChange={setToolsOpen} swipeDirection="left">
        <DrawerContent className="max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add capabilities</DrawerTitle>
            <DrawerDescription>Pick tools and memory for this agent.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <ToolPicker />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={chatOpen} onOpenChange={setChatOpen} swipeDirection="up">
        <DrawerContent className="h-[85vh] max-h-[85vh] md:h-[75vh] md:max-h-[75vh]">
          <DrawerHeader>
            <DrawerTitle>Test chat</DrawerTitle>
            <DrawerDescription>
              Try your agent with the current canvas. Unsaved changes are included.
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatPanel
              agentId={agent.id}
              getDefinition={() => useCanvasStore.getState().getDefinition()}
              welcomeMessage={agent.welcomeMessage}
              starterPrompts={(agent.starterPrompts as string[]) ?? []}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen} swipeDirection="right">
        <DrawerContent className="max-w-md">
          <DrawerHeader>
            <DrawerTitle>Agent settings</DrawerTitle>
            <DrawerDescription>Edit agent info and the selected node.</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-6">
            <div className="space-y-3">
              <h2 className="text-sm font-medium">Agent info</h2>
              <div className="space-y-2">
                <Label htmlFor="agent-name">Name</Label>
                <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-desc">Description</Label>
                <Input
                  id="agent-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-medium">Chat experience</h2>
              <div className="space-y-2">
                <Label htmlFor="agent-welcome">Welcome message</Label>
                <Input
                  id="agent-welcome"
                  value={welcome}
                  maxLength={500}
                  placeholder="Shown at the top of an empty chat"
                  onChange={(e) => setWelcome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-starters">Starter prompts</Label>
                <Textarea
                  id="agent-starters"
                  rows={4}
                  value={starters}
                  placeholder={"One per line, up to 6\nWhat's the weather in Tokyo?"}
                  onChange={(e) => setStarters(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  These appear as quick-start buttons in the chat.
                </p>
              </div>
            </div>
            <NodeSettingsPanel />
          </div>

          {/* The header Save button is hidden behind this drawer, so it gets its own here. */}
          <div className="flex items-center justify-between gap-3 border-t border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">
              {hasUnsavedChanges ? "You have unsaved changes" : "All changes saved"}
            </p>
            <Button onClick={handleSave} disabled={saveAgent.isPending || !hasUnsavedChanges}>
              {saveAgent.isPending ? <Spinner /> : <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />}
              {saveAgent.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
