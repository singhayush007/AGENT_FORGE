import type { AgentDefinition } from "@/shared/types/agentDefinition.types";

export type TemplateCategory = "Everyday" | "Research" | "Productivity" | "Developer" | "Finance";

export type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: TemplateCategory;
  welcomeMessage: string;
  starterPrompts: string[];
  definition: AgentDefinition;
};

