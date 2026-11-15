import { describe, expect, it } from "vitest";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { buildLimitFallback } from "@/features/runtime/util/limitFallback.utils";

describe("buildLimitFallback", () => {
  it("returns the latest tool findings and skips the limit notice", () => {
    const out = buildLimitFallback([
      new HumanMessage("q"),
      new ToolMessage({ content: "first finding", tool_call_id: "a" }),
      new ToolMessage({ content: "second finding", tool_call_id: "b" }),
      new ToolMessage({ content: "Tool limit reached. Answer now.", tool_call_id: "c" }),
    ]);
    expect(out).toContain("first finding");
    expect(out).toContain("second finding");
    expect(out).not.toContain("Tool limit reached");
  });

  it("still gives a helpful message when no tool returned anything", () => {
    expect(buildLimitFallback([new HumanMessage("q")])).toMatch(/more specific/i);
  });
});
