"use client";

import * as React from "react";
import Link from "next/link";
import { ErrorState } from "@/shared/components/ErrorState";
import { Button } from "@/shared/components/ui/button";

// Catches errors inside the dashboard but keeps the sidebar visible.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <ErrorState
        className="w-full max-w-lg"
        title="This page hit an error"
        description="Something unexpected happened. You can retry, or go back to your agents."
        onRetry={reset}
      />
      <Button variant="ghost" nativeButton={false} render={<Link href="/agents" />}>
        Back to agents
      </Button>
    </div>
  );
}
