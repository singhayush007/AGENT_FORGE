import { BuilderPage } from "@/features/builder/views/BuilderPage";

export default async function BuilderRoute({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  return <BuilderPage agentId={agentId} />;
}
