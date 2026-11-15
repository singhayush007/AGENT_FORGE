import { ToolMessage, type BaseMessage } from "@langchain/core/messages";

// Told to stop using tools, a model sometimes still tries to call one and the provider rejects it.
// Instead of failing the whole run, we hand back what the tools already found.
export function buildLimitFallback(messages: BaseMessage[]) {
  const found = messages
    .filter((m): m is ToolMessage => ToolMessage.isInstance(m))
    .map((m) => (typeof m.content === "string" ? m.content : JSON.stringify(m.content)))
    .filter((text) => !text.startsWith("Tool limit reached"))
    .slice(-2)
    .map((text) => `- ${text.slice(0, 500).replace(/\s+/g, " ")}${text.length > 500 ? "…" : ""}`);

  const base = "I used all my tool calls before I could write a full answer.";
  return found.length
    ? `${base} Here is what I found so far:\n\n${found.join("\n")}\n\nAsk a more specific question (for example name a file) and I will go deeper.`
    : `${base} Please ask a more specific question (for example name a file or folder).`;
}
