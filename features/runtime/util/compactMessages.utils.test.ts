import { describe, expect, it } from "vitest";
import { AIMessage, HumanMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { compactToolOutputs } from "@/features/runtime/util/compactMessages.utils";

const tool = (id: string, size: number) => new ToolMessage({ content: "x".repeat(size), tool_call_id: id });
const len = (m: BaseMessage) => String(m.content).length;

describe("compactToolOutputs", () => {
  it("keeps the latest tool outputs in full and shortens older ones", () => {
    const msgs: BaseMessage[] = [new HumanMessage("hi"), tool("a", 3000), tool("b", 3000), tool("c", 3000), new AIMessage("ok")];
    compactToolOutputs(msgs, 2, 500);
    expect(len(msgs[1])).toBeLessThan(600);
    expect(len(msgs[2])).toBe(3000);
    expect(len(msgs[3])).toBe(3000);
  });

  it("keeps the tool_call_id and never touches other messages", () => {
    const msgs: BaseMessage[] = [new HumanMessage("question"), tool("a", 2000), tool("b", 2000)];
    compactToolOutputs(msgs, 1, 100);
    expect((msgs[1] as ToolMessage).tool_call_id).toBe("a");
    expect(msgs[0].content).toBe("question");
  });

  it("does nothing when outputs are already small", () => {
    const msgs: BaseMessage[] = [tool("a", 50), tool("b", 50)];
    compactToolOutputs(msgs, 1, 100);
    expect(len(msgs[0])).toBe(50);
  });
});
