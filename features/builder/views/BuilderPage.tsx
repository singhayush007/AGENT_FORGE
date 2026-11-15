"use client";

import Link from "next/link";
import { AgentBuilder } from "@/features/builder/components/AgentBuilder";
import { useAgent } from "@/features/agents/hooks/UseAgents";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ErrorState";
import { Spinner } from "@/shared/components/ui/spinner";

export function BuilderPage({ agentId }: { agentId: string }) {
  const { data: agent, isLoading, isError, refetch } = useAgent(agentId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <ErrorState
          title="Could not open this agent"
          description="Loading failed. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">Agent not found.</p>
        <Button render={<Link href="/agents" />} nativeButton={false}>
          Back to agents
        </Button>
      </div>
    );
  }

  return <AgentBuilder agent={agent} />;
}
