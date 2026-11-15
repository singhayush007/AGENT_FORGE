"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createBlankAgent,
  createFromTemplate,
  deleteAgent,
  duplicateAgent,
  importAgent,
  fetchAgent,
  listAgents,
  saveAgent,
  togglePin,
  type SaveAgentInput,
} from "@/features/agents/actions/agent.actions";
import { agentKeys } from "@/features/agents/constants/queryKeys.constants";
import { toast } from "@/shared/components/ui/toast";
import { friendlyMessage } from "@/shared/utils/errors.utils";

function showError(title: string) {
  return (error: Error) =>
    toast.add({ title, description: friendlyMessage(error), type: "error" });
}

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: listAgents,
  });
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => fetchAgent(agentId),
  });
}

export function useCreateBlankAgent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createBlankAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push(`/agents/${agent.id}/builder`);
    },
    onError: showError("Could not create agent"),
  });
}

export function useCreateFromTemplate() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createFromTemplate,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push(`/agents/${agent.id}/builder`);
    },
    onError: showError("Could not create agent"),
  });
}

export function useDuplicateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      toast.add({ title: "Agent duplicated", type: "success" });
    },
    onError: showError("Could not duplicate agent"),
  });
}

export function useImportAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (raw: unknown) => {
      const result = await importAgent(raw);
      if ("error" in result) throw new Error(result.error);
      return result.agent;
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      toast.add({ title: `Imported "${agent.name}"`, type: "success" });
    },
    onError: showError("Could not import agent"),
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentKeys.list() }),
    onError: showError("Could not update pin"),
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      toast.add({ title: "Agent deleted", type: "success" });
    },
    onError: showError("Could not delete agent"),
  });
}

export function useSaveAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveAgentInput) => saveAgent(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
    },
  });
}
