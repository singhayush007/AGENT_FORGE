import { describe, expect, it } from "vitest";
import { getToolIcon, getToolLabel, toolsCatalog } from "@/shared/utils/tools.utils";

describe("tools catalog", () => {
  it("has unique tool ids", () => {
    const ids = toolsCatalog.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("labels built-in tools and falls back to the id for unknown ones", () => {
    expect(getToolLabel("weather")).toBe("Weather");
    expect(getToolLabel("something_new")).toBe("something_new");
  });

  it("uses the custom tool name and icon for custom tools", () => {
    expect(getToolLabel("custom", { type: "custom", name: "My API" })).toBe("My API");
    expect(getToolIcon("custom", { type: "custom" })).toBe("custom");
  });
});
