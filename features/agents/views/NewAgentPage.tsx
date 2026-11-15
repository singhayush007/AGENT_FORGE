"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowRight01Icon, SparklesIcon } from "@hugeicons/core-free-icons";

import { TemplateCard } from "@/features/agents/components/TemplateCard";
import { useCreateBlankAgent } from "@/features/agents/hooks/UseAgents";
import {
  templateCategories,
  templates,
} from "@/features/agents/constants/templates.constants";
import type { TemplateCategory } from "@/features/agents/types/template.types";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

type Filter = "All" | TemplateCategory;

export function NewAgentPage() {
  const createBlank = useCreateBlankAgent();
  const [filter, setFilter] = React.useState<Filter>("All");

  const visible =
    filter === "All" ? templates : templates.filter((t) => t.category === filter);
  const filters: Filter[] = ["All", ...templateCategories];

  return (
    <>
      {/* Hero: headline + start-from-scratch in one strong block */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-violet-500/10 to-fuchsia-500/10 px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]"
        />
        <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-primary/25 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5" />
            {templates.length} templates · no code needed
          </span>
          <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            What will your agent{" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              do?
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-base text-muted-foreground">
            Pick a ready-made template and be chatting in seconds, or start from
            a blank canvas and wire up your own tools.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 w-full px-6 sm:w-auto"
              onClick={() => createBlank.mutate()}
              disabled={createBlank.isPending}
            >
              {createBlank.isPending ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
              )}
              Start from scratch
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full bg-background/60 px-6 backdrop-blur sm:w-auto"
              nativeButton={false}
              render={<a href="#templates" />}
            >
              Browse templates
            </Button>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="scroll-mt-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Templates</h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} {visible.length === 1 ? "template" : "templates"}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Template categories"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 [scrollbar-width:none]"
          >
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </>
  );
}
