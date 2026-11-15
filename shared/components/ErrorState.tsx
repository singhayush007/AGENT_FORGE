import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this. Check your connection and try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-14 text-center",
        className
      )}
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-6" />
      </span>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
