import { describe, expect, it } from "vitest";
import { validateGraph } from "@/shared/utils/validateGraph.utils";
import { defaultBuilderDefinition } from "@/shared/types/workflow.types";

describe("validateGraph", () => {
  it("accepts the default Start -> Agent -> End graph", () => {
    expect(() => validateGraph(defaultBuilderDefinition())).not.toThrow();
  });

  it("rejects a graph with a missing edge", () => {
    const def = defaultBuilderDefinition();
    def.edges = def.edges.slice(0, 1);
    expect(() => validateGraph(def)).toThrow(/No path/);
  });

  it("rejects edges that point to unknown nodes", () => {
    const def = defaultBuilderDefinition();
    def.edges.push({ id: "bad", source: "agent", target: "ghost" });
    expect(() => validateGraph(def)).toThrow(/unknown node/);
  });

  it("rejects a graph without a Start node", () => {
    const def = defaultBuilderDefinition();
    def.nodes = def.nodes.filter((n) => n.type !== "start");
    expect(() => validateGraph(def)).toThrow(/Start/);
  });
});
