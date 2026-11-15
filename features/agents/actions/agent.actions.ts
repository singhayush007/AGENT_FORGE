"use server";

import type { Edge, Node } from "@xyflow/react";
import { prisma } from "@/shared/lib/db";
import type { Prisma } from "@/shared/lib/generated/prisma/client";
import { requireAuth } from "@/features/auth/actions/auth.actions";
import { migrateV1ToV2 } from "@/shared/utils/workflowMigrate.utils";
import {
  builderDefinitionSchema,
  defaultBuilderDefinition,
  type BuilderDefinition,
} from "@/shared/types/workflow.types";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getTemplate } from "@/features/agents/constants/templates.constants";

export type SaveAgentInput = {
  name: string;
  description: string;
  draftDefinition: BuilderDefinition;
  canvas: { nodes: Node[]; edges: Edge[] };
  welcomeMessage?: string;
  starterPrompts?: string[];
};

export async function listAgents() {
  const user = await requireAuth();

  return prisma.agent.findMany({
    where: {
      userId: user.user.id,
    },
    // Pinned agents first, then most recently edited.
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
}

export async function fetchAgent(agentId: string) {
  const user = await requireAuth();

  return prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
  });
}

export async function createBlankAgent() {
  const user = await requireAuth();

  return prisma.agent.create({
    data: {
      userId: user.user.id,
      name: "Untitled Agent",
      draftDefinition: defaultBuilderDefinition() as Prisma.InputJsonValue,
    },
  });
}

export async function createFromTemplate(templateId: string) {
  const user = await requireAuth();
  const template = getTemplate(templateId);

  if (!template) {
    throw new Error("Template not found");
  }

  return prisma.agent.create({
    data: {
      userId: user.user.id,
      templateId: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      welcomeMessage: template.welcomeMessage,
      starterPrompts: template.starterPrompts,
      // Templates are written in the simple V1 format; we store them as a V2 graph.
      draftDefinition: migrateV1ToV2(template.definition) as Prisma.InputJsonValue,
    },
  });
}

export async function deleteAgent(agentId: string) {
  const user = await requireAuth();

  await prisma.agent.deleteMany({
    where: { id: agentId, userId: user.user.id },
  });
}

export async function saveAgent(agentId: string, data: SaveAgentInput) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
  });

  if (!agent) {
    throw new Error("Agent not found");
  }

  // Server actions can be called by anyone, so check the shape before saving.
  const draftDefinition = builderDefinitionSchema.parse(data.draftDefinition);

  return prisma.agent.update({
    where: { id: agentId },
    data: {
      name: data.name,
      description: data.description,
      ...(data.welcomeMessage !== undefined && {
        welcomeMessage: data.welcomeMessage.slice(0, 500),
      }),
      ...(data.starterPrompts !== undefined && {
        starterPrompts: data.starterPrompts
          .map((p) => p.trim().slice(0, 200))
          .filter(Boolean)
          .slice(0, 6),
      }),
      draftDefinition: draftDefinition as Prisma.InputJsonValue,
      canvas: data.canvas as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function duplicateAgent(agentId: string) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
  });

  if (!agent) {
    throw new Error("Agent not found");
  }

  return prisma.agent.create({
    data: {
      userId: user.user.id,
      templateId: agent.templateId,
      name: `${agent.name} (copy)`,
      description: agent.description,
      icon: agent.icon,
      welcomeMessage: agent.welcomeMessage,
      starterPrompts: agent.starterPrompts as Prisma.InputJsonValue,
      draftDefinition: agent.draftDefinition as Prisma.InputJsonValue,
      canvas: agent.canvas as Prisma.InputJsonValue,
    },
  });
}

// ---- Export / import -------------------------------------------------------

const EXPORT_VERSION = 1;

const importSchema = z.object({
  agentforge: z.literal(EXPORT_VERSION),
  agent: z.object({
    name: z.string().trim().min(1).max(120),
    description: z.string().max(500).default(""),
    icon: z.string().max(16).default("🤖"),
    welcomeMessage: z.string().max(500).default(""),
    starterPrompts: z.array(z.string().max(200)).max(10).default([]),
    draftDefinition: builderDefinitionSchema,
    canvas: z.record(z.string(), z.unknown()).default({}),
  }),
});

export async function exportAgent(agentId: string) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
  });

  if (!agent) {
    throw new Error("Agent not found");
  }

  // Custom HTTP tools may hold secret headers, so we warn in the UI before sharing the file.
  return {
    agentforge: EXPORT_VERSION,
    agent: {
      name: agent.name,
      description: agent.description,
      icon: agent.icon,
      welcomeMessage: agent.welcomeMessage,
      starterPrompts: agent.starterPrompts,
      draftDefinition: agent.draftDefinition,
      canvas: agent.canvas,
    },
  };
}

// Returns { error } instead of throwing: in production Next hides thrown messages,
// and "this file is not valid" is something the user needs to read.
export async function importAgent(
  raw: unknown
): Promise<{ agent: { id: string; name: string } } | { error: string }> {
  const user = await requireAuth();

  const parsed = importSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "This file is not a valid AgentForge export." };
  }

  const { agent } = parsed.data;

  const created = await prisma.agent.create({
    data: {
      userId: user.user.id,
      name: agent.name,
      description: agent.description,
      icon: agent.icon,
      welcomeMessage: agent.welcomeMessage,
      starterPrompts: agent.starterPrompts,
      draftDefinition: agent.draftDefinition as Prisma.InputJsonValue,
      canvas: agent.canvas as Prisma.InputJsonValue,
    },
  });

  return { agent: { id: created.id, name: created.name } };
}

// ---- Pin & share -----------------------------------------------------------

export async function togglePin(agentId: string) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
    select: { pinned: true },
  });
  if (!agent) throw new Error("Agent not found");

  const updated = await prisma.agent.update({
    where: { id: agentId },
    data: { pinned: !agent.pinned },
    select: { pinned: true },
  });
  return updated.pinned;
}

export async function getShareState(agentId: string) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
    select: { shareId: true },
  });
  if (!agent) throw new Error("Agent not found");

  return { shareId: agent.shareId };
}

export async function setSharing(agentId: string, enabled: boolean) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
    select: { shareId: true },
  });
  if (!agent) throw new Error("Agent not found");

  // Turning it off clears the id, so the old link stops working for good.
  const shareId = enabled ? (agent.shareId ?? randomBytes(9).toString("base64url")) : null;

  await prisma.agent.update({
    where: { id: agentId },
    data: { shareId },
  });
  return { shareId };
}
