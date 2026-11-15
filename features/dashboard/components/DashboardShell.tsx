"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Analytics01Icon,
  BotIcon,
  Logout01Icon,
  Menu01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { Logo } from "@/shared/components/Logo";
import { Button } from "@/shared/components/ui/button";
import { ModeToggle } from "@/shared/components/ui/mode-toggle";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  CommandPalette,
  CommandPaletteTrigger,
} from "@/features/dashboard/components/CommandPalette";
import { signOut } from "@/features/auth/actions/auth.actions";
import { cn } from "@/shared/lib/utils";

type User = { name?: string | null; email: string; image?: string | null };

const nav = [
  { href: "/agents", label: "My Agents", icon: BotIcon, exact: true },
  { href: "/agents/new", label: "New Agent", icon: Add01Icon, exact: true },
  { href: "/analytics", label: "Analytics", icon: Analytics01Icon, exact: true },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Workspace
      </p>
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({ user }: { user: User }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
        <Avatar>
          {user.image && <AvatarImage src={user.image} alt={user.name ?? "User"} />}
          <AvatarFallback>
            {(user.name?.[0] ?? user.email[0]).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {user.name ?? "Account"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <ModeToggle />
      </div>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          Sign out
        </Button>
      </form>
    </div>
  );
}

function SidebarBody({
  user,
  onNavigate,
  onSearch,
}: {
  user: User;
  onNavigate?: () => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo href="/agents" />
      </div>
      <div className="px-3 pb-3">
        <CommandPaletteTrigger
          onClick={() => {
            onNavigate?.();
            onSearch();
          }}
        />
      </div>
      <div className="flex-1 px-3 py-2">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="p-3">
        <UserCard user={user} />
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  // The builder and the full-page chat get the whole screen: no sidebar.
  if (pathname.includes("/builder") || pathname.endsWith("/chat")) {
    return <div className="flex min-h-full flex-1 bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-full flex-1 bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-background md:block">
        <SidebarBody user={user} onSearch={() => setPaletteOpen(true)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <Logo href="/agents" />
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Search"
            onClick={() => setPaletteOpen(true)}
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          </Button>
          </div>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarBody
              user={user}
              onNavigate={() => setOpen(false)}
              onSearch={() => setPaletteOpen(true)}
            />
          </SheetContent>
        </Sheet>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
