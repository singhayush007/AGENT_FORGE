"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-2xl">
        ⚠️
      </span>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          An unexpected error happened. You can try again, or head back to the dashboard.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/agents" />}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
