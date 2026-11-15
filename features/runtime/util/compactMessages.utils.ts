import { ToolMessage, type BaseMessage } from "@langchain/core/messages";

// Every model call re-sends the whole conversation. After a few file reads or web pages that adds up
// fast, and free tiers reject a single request above about 8k tokens ("request too large").
// So older tool outputs are shortened and only the latest few stay in full.
export function compactToolOutputs(messages: BaseMessage[], keepFull: number, maxOldChars: number) {
  const toolIndexes = messages.flatMap((m, i) => (ToolMessage.isInstance(m) ? [i] : []));
  const old = toolIndexes.slice(0, Math.max(0, toolIndexes.length - keepFull));

  for (const i of old) {
    const m = messages[i] as ToolMessage;
    const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    if (text.length > maxOldChars) {
      messages[i] = new ToolMessage({
        content: `${text.slice(0, maxOldChars)}\n…[earlier output shortened]`,
        tool_call_id: m.tool_call_id,
      });
    }
  }
}
