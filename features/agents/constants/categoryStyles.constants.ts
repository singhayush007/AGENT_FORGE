import type { TemplateCategory } from "@/features/agents/types/template.types";

// Full class names on purpose, so Tailwind can see and generate them.
export const categoryStyles: Record<
  TemplateCategory,
  { tile: string; chip: string; glow: string; dot: string; band: string }
> = {
  Everyday: {
    tile: "from-sky-400/25 to-sky-500/5 ring-sky-500/20",
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    glow: "hover:border-sky-500/50 hover:shadow-sky-500/15",
    dot: "bg-sky-500",
    band: "from-sky-500/30 via-sky-400/10 to-transparent",
  },
  Research: {
    tile: "from-amber-400/25 to-amber-500/5 ring-amber-500/20",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    glow: "hover:border-amber-500/50 hover:shadow-amber-500/15",
    dot: "bg-amber-500",
    band: "from-amber-500/30 via-amber-400/10 to-transparent",
  },
  Productivity: {
    tile: "from-violet-400/25 to-violet-500/5 ring-violet-500/20",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    glow: "hover:border-violet-500/50 hover:shadow-violet-500/15",
    dot: "bg-violet-500",
    band: "from-violet-500/30 via-violet-400/10 to-transparent",
  },
  Developer: {
    tile: "from-emerald-400/25 to-emerald-500/5 ring-emerald-500/20",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    glow: "hover:border-emerald-500/50 hover:shadow-emerald-500/15",
    dot: "bg-emerald-500",
    band: "from-emerald-500/30 via-emerald-400/10 to-transparent",
  },
  Finance: {
    tile: "from-lime-400/25 to-lime-500/5 ring-lime-500/20",
    chip: "bg-lime-500/10 text-lime-700 dark:text-lime-300",
    glow: "hover:border-lime-500/50 hover:shadow-lime-500/15",
    dot: "bg-lime-500",
    band: "from-lime-500/30 via-lime-400/10 to-transparent",
  },
};
