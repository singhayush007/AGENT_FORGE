"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { useCreateFromTemplate } from "@/features/agents/hooks/UseAgents";
import type { AgentTemplate } from "@/features/agents/types/template.types";
import { categoryStyles } from "@/features/agents/constants/categoryStyles.constants";
import { getToolLabel } from "@/shared/utils/tools.utils";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

export function TemplateCard({ template }: { template: AgentTemplate }) {
  const createFromTemplate = useCreateFromTemplate();
  const pending = createFromTemplate.isPending;
  const tools = template.definition.tools;
  const style = categoryStyles[template.category];

  return (
    <button
      type="button"
      onClick={() => createFromTemplate.mutate(template.id)}
      disabled={pending}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60",
        style.glow
      )}
    >
      {/* Colored banner with the icon overlapping its bottom edge */}
      <div className={cn("relative h-14 bg-gradient-to-br sm:h-20", style.band)}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px] text-foreground/10"
        />
        <span
          className={cn(
            "absolute right-3 top-3 inline-flex sm:right-4 sm:top-4 items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur",
            style.chip
          )}
        >
          <span className={cn("size-1.5 rounded-full", style.dot)} />
          {template.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
        <span className="-mt-7 mb-2 flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-2xl shadow-md sm:-mt-8 sm:mb-3 sm:size-16 sm:text-3xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
          {template.icon}
        </span>

        <h3 className="font-heading text-lg font-semibold leading-tight">{template.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-3 sm:pt-4">
          {tools.slice(0, 3).map((t, i) => (
            <span
              key={`${t.toolId}-${i}`}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {getToolLabel(t.toolId, t.config)}
            </span>
          ))}
          {tools.length > 3 && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              +{tools.length - 3}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm sm:mt-4 font-medium text-primary">
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Creating...
            </span>
          ) : (
            <>
              Use template
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
