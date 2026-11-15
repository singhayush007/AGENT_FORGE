"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Analytics01Icon,
  BotIcon,
  Message01Icon,
  Search01Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { Button } from "@/shared/components/ui/button";
import { useAgents } from "@/features/agents/hooks/UseAgents";

export function CommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-2 text-muted-foreground"
      onClick={onClick}
    >
      <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
        ⌘K
      </kbd>
    </Button>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: agents } = useAgents();

  // Cmd/Ctrl + K toggles the palette from anywhere in the dashboard.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      {/* cmdk needs a <Command> root around the input and list */}
      <Command>
      <CommandInput placeholder="Search agents or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => go("/agents")}>
            <HugeiconsIcon icon={BotIcon} strokeWidth={2} />
            My Agents
          </CommandItem>
          <CommandItem onSelect={() => go("/agents/new")}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            Create new agent
          </CommandItem>
          <CommandItem onSelect={() => go("/analytics")}>
            <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />
            Analytics
          </CommandItem>
        </CommandGroup>

        {(agents ?? []).length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Agents">
              {(agents ?? []).slice(0, 20).map((a) => (
                <CommandItem
                  key={a.id}
                  value={`${a.name} ${a.description}`}
                  onSelect={() => go(`/agents/${a.id}/builder`)}
                >
                  <span className="text-base">{a.icon}</span>
                  {a.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Chat with">
              {(agents ?? []).slice(0, 20).map((a) => (
                <CommandItem
                  key={`chat-${a.id}`}
                  value={`chat ${a.name}`}
                  onSelect={() => go(`/agents/${a.id}/chat`)}
                >
                  <HugeiconsIcon icon={Message01Icon} strokeWidth={2} />
                  {a.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Preferences">
          <CommandItem
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              onOpenChange(false);
            }}
          >
            <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
            Toggle theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
