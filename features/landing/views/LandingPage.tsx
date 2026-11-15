import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BotIcon,
  Download01Icon,
  Message01Icon,
  SparklesIcon,
  ToolsIcon,
  AiBrain01Icon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";

import { Logo } from "@/shared/components/Logo";
import { Button } from "@/shared/components/ui/button";
import { ModeToggle } from "@/shared/components/ui/mode-toggle";
import { templates } from "@/features/agents/constants/templates.constants";
import { categoryStyles } from "@/features/agents/constants/categoryStyles.constants";
import { cn } from "@/shared/lib/utils";

const steps = [
  { n: "01", title: "Pick a template", body: "Start from 10 ready-made agents, or a blank canvas." },
  { n: "02", title: "Shape it", body: "Write instructions, add tools, and connect nodes visually." },
  { n: "03", title: "Chat & ship", body: "Test with live streaming chat, then keep every conversation." },
];

function BentoCard({
  title,
  body,
  icon,
  className,
  children,
}: {
  title: string;
  body: string;
  icon: typeof BotIcon;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative mb-4 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/10">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
      </span>
      <h3 className="relative font-heading text-lg font-semibold">{title}</h3>
      <p className="relative mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {children ? <div className="relative mt-6 flex-1">{children}</div> : null}
    </div>
  );
}

function Features() {
  const pill = "rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-sm";
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Row 1: wide + normal */}
      <BentoCard
        className="md:col-span-2"
        icon={DashboardSquare01Icon}
        title="Visual builder"
        body="Drag nodes on a canvas: Start → Agent → End. See exactly how your agent flows."
      >
        <div className="flex flex-nowrap items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-border bg-muted/40 p-4 sm:gap-2 [background-image:radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:16px_16px]">
          <span className={cn(pill, "border-emerald-500/40")}>▶ Start</span>
          <span className="h-px w-3 shrink-0 bg-primary/50 sm:w-8" />
          <span className={cn(pill, "border-primary/50 bg-card shadow-md shadow-primary/10")}>
            🤖 Agent
            <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-emerald-400" />
          </span>
          <span className="h-px w-3 shrink-0 bg-primary/50 sm:w-8" />
          <span className={cn(pill, "border-rose-500/40")}>⚑ End</span>
        </div>
      </BentoCard>

      <BentoCard
        icon={ToolsIcon}
        title="12 built-in tools"
        body="Search, weather, Wikipedia, GitHub and more. Or connect any API."
      >
        <div className="flex flex-wrap gap-1.5">
          {["Web Search", "Weather", "Wikipedia", "Currency", "GitHub", "Calculator", "Hacker News", "Custom API"].map((t) => (
            <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </BentoCard>

      {/* Row 2: three equal cards */}
      <BentoCard
        icon={Message01Icon}
        title="Live streaming chat"
        body="Answers stream in word by word, with tool status so you always know what's happening."
      >
        <div className="space-y-2 text-xs">
          <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-primary px-3 py-1.5 text-primary-foreground">
            Weather in Tokyo?
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Weather · running
          </div>
          <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3 py-2">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
          </div>
        </div>
      </BentoCard>

      <BentoCard
        icon={AiBrain01Icon}
        title="Memory & safety limits"
        body="Toggle memory per agent. Cap tool calls, steps and run time."
      >
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
            <span>Memory</span>
            <span className="flex h-5 w-9 items-center justify-end rounded-full bg-primary p-0.5">
              <span className="size-4 rounded-full bg-background" />
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
            <span>Max tool calls</span>
            <span className="font-medium">5</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
            <span>Timeout</span>
            <span className="font-medium">60s</span>
          </div>
        </div>
      </BentoCard>

      <BentoCard
        icon={Download01Icon}
        title="Import & export"
        body="Back up an agent as JSON, or share it with a teammate."
      >
        <pre className="overflow-hidden rounded-xl border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
{`{
  "agentforge": 1,
  "agent": {
    "name": "Weather Pro",
    "tools": ["weather"]
  }
}`}
        </pre>
      </BentoCard>
    </div>
  );
}

function ProductMock() {
  const node =
    "rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium shadow-sm";
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div
        aria-hidden
        className="absolute inset-x-10 -top-6 h-40 rounded-full bg-gradient-to-r from-primary/40 via-violet-500/30 to-fuchsia-500/30 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-xs text-muted-foreground">Weather Assistant · builder</span>
        </div>

        <div className="grid md:grid-cols-5">
          {/* canvas */}
          <div className="relative min-h-72 border-b border-border bg-muted/30 [background-image:radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:20px_20px] md:col-span-3 md:border-b-0 md:border-r">
            <div className="absolute left-1/2 top-6 -translate-x-1/2">
              <div className={cn(node, "border-emerald-500/40")}>▶ Start</div>
            </div>
            <div className="absolute left-1/2 top-[4.1rem] h-9 w-px -translate-x-1/2 bg-primary/50" />
            <div className="absolute left-1/2 top-[6.5rem] w-52 -translate-x-1/2 rounded-2xl border border-primary/40 bg-card p-3 shadow-lg shadow-primary/10">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <HugeiconsIcon icon={BotIcon} strokeWidth={2} className="size-3.5" />
                </span>
                Agent
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {["Weather", "Web Search", "Date & Time"].map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute left-1/2 top-[13.2rem] h-8 w-px -translate-x-1/2 bg-primary/50" />
            <div className="absolute left-1/2 top-[15.2rem] -translate-x-1/2">
              <div className={cn(node, "border-rose-500/40")}>⚑ End</div>
            </div>
          </div>

          {/* chat */}
          <div className="flex flex-col justify-end gap-3 p-5 md:col-span-2">
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
              Weather in Tokyo this weekend?
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Weather · done
            </span>
            <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm">
              Sat: 21°C, clear. Sun: 19°C with light rain. Pack a light jacket.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage({ signedIn }: { signedIn: boolean }) {
  const ctaHref = signedIn ? "/agents" : "/signup";
  const ctaLabel = signedIn ? "Open dashboard" : "Get started free";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* grid + glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] [background-image:radial-gradient(var(--border)_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top,black_35%,transparent_75%)]"
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo href="/" />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#templates" className="transition-colors hover:text-foreground">Templates</a>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {!signedIn && (
              <Button variant="ghost" className="hidden sm:inline-flex" nativeButton={false} render={<Link href="/login" />}>
                Sign in
              </Button>
            )}
            <Button nativeButton={false} render={<Link href={ctaHref} />}>
              {signedIn ? "Dashboard" : "Get started"}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5" />
            Open-source AI agent builder
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Build AI agents{" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              visually
            </span>
            , not in code.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Design an agent on a canvas, give it real tools, and chat with it
            while the answers stream in live. No setup, no boilerplate.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 w-full px-6 sm:w-auto" nativeButton={false} render={<Link href={ctaHref} />}>
              {ctaLabel}
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
            <Button size="lg" variant="outline" className="h-11 w-full px-6 sm:w-auto" nativeButton={false} render={<a href="#how" />}>
              See how it works
            </Button>
          </div>

          <ProductMock />
        </section>

        {/* Stack strip */}
        <section aria-label="Built with" className="border-y border-border/60 bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
            <span className="text-xs uppercase tracking-wider">Built with</span>
            {["Next.js 16", "LangGraph", "React Flow", "Prisma", "Better Auth", "shadcn/ui"].map((t) => (
              <span key={t} className="font-medium text-foreground/80">{t}</span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to ship an agent
            </h2>
            <p className="mt-3 text-muted-foreground">
              A focused toolkit: build it, test it, keep the history.
            </p>
          </div>
          <Features />
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y border-border/60 bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="mb-12 text-center font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              From idea to working agent in three steps
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="relative rounded-3xl border border-border bg-card p-6">
                  <span className="font-heading text-5xl font-semibold text-primary/20">{s.n}</span>
                  <h3 className="mt-2 font-heading text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with a template
            </h2>
            <p className="mt-3 text-muted-foreground">
              {templates.length} ready-made agents for research, coding, travel, money and more.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.slice(0, 6).map((t) => {
              const st = categoryStyles[t.category];
              return (
                <div key={t.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ring-1", st.tile)}>
                    {t.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-violet-500/10 to-fuchsia-500/10 px-6 py-16 text-center">
            <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <h2 className="relative font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Build your first agent in minutes
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              Sign in with GitHub or email and start from a template.
            </p>
            <div className="relative mt-8">
              <Button size="lg" className="h-11 px-6" nativeButton={false} render={<Link href={ctaHref} />}>
                {ctaLabel}
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo href="/" />
          <p>© {new Date().getFullYear()} AgentForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
