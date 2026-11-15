import { describe, expect, it } from "vitest";
import { getTemplate, templateCategories, templates } from "@/features/agents/constants/templates.constants";
import { toolsCatalog } from "@/shared/utils/tools.utils";
import { migrateV1ToV2 } from "@/shared/utils/workflowMigrate.utils";
import { builderDefinitionSchema } from "@/shared/types/workflow.types";
import { validateGraph } from "@/shared/utils/validateGraph.utils";

describe("agent templates", () => {
  it("have unique ids and a valid category", () => {
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of templates) expect(templateCategories).toContain(t.category);
  });

  it("only use tools that exist in the catalog", () => {
    const known = new Set(toolsCatalog.map((t) => t.id));
    for (const t of templates) {
      for (const tool of t.definition.tools) expect(known.has(tool.toolId), `${t.id}: ${tool.toolId}`).toBe(true);
    }
  });

  it("migrate to a valid, runnable V2 graph", () => {
    for (const t of templates) {
      const v2 = migrateV1ToV2(t.definition);
      expect(() => builderDefinitionSchema.parse(v2), t.id).not.toThrow();
      expect(() => validateGraph(v2), t.id).not.toThrow();
    }
  });

  it("can be looked up by id", () => {
    expect(getTemplate("weather")?.name).toBe("Weather Assistant");
    expect(getTemplate("nope")).toBeUndefined();
  });
});
