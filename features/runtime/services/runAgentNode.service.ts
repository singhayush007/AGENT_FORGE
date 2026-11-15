import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import type { AgentNodeConfig } from "@/shared/types/workflow.types";
import { compactToolOutputs } from "@/features/runtime/util/compactMessages.utils";
import { githubDefaultsNote } from "@/features/tools/services/github/githubClient.service";
import { getToolsForAgent } from "@/features/tools/services/registry.service";
import type { RunEvent } from "@/features/runtime/services/runAgent.service";

type RunAgentNodeOptions = {
  config: AgentNodeConfig;
  history: { role: string; content: string }[];
  userMessage: string;
  userId: string;
  maxToolCalls: number;
  onEvent: (event: RunEvent) => void;
};

// About 750 tokens. Enough for a useful answer without hitting provider limits.
const MAX_TOOL_OUTPUT_CHARS = 3000;

export async function runAgentNode({
  config,
  history,
  userMessage,
  userId,
  maxToolCalls,
  onEvent,
}: RunAgentNodeOptions) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Add OPENAI_API_KEY to .env");
  }

  const tools = await getToolsForAgent(config, userId);
  // Works with any OpenAI-compatible provider (Groq, Gemini, OpenRouter, Ollama...).
  // Set OPENAI_BASE_URL to switch provider, and LLM_MODEL to override the model ID.
  const model = new ChatOpenAI({
    model: process.env.LLM_MODEL || config.modelId,
    apiKey,
    configuration: process.env.OPENAI_BASE_URL
      ? { baseURL: process.env.OPENAI_BASE_URL }
      : undefined,
  });

  const hasGithubTools = tools.some((t) => t.name.startsWith("github_"));
  const githubNote = hasGithubTools ? githubDefaultsNote(config.github) : "";
  const systemPrompt = githubNote ? `${config.instructions}\n\n${githubNote}` : config.instructions;

  const modelWithTools = tools.length > 0 ? model.bindTools(tools) : model;

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...history.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    ),
    new HumanMessage(userMessage),
  ];

  let toolCallCount = 0;
  // Once the tool limit is hit we stop offering tools and let the model answer with what it has.
  let limitReached = false;
  let finalText = "";

  while (true) {
    // Stream the reply so the user sees text as it is generated.
    // Each chunk is a small piece; we join them into one full message.
    let response: AIMessageChunk | undefined;

    // Keep the request small: only the latest tool outputs stay in full.
    compactToolOutputs(messages, 2, 800);

    // Some models (notably open ones on free tiers) occasionally invent a tool name or emit a
    // malformed tool call. The provider rejects that with an error. We remind the model of the
    // real tool names and try again instead of failing the whole run.
    for (let attempt = 0; ; attempt++) {
      try {
        for await (const chunk of await (limitReached ? model : modelWithTools).stream(messages)) {
          response = response ? response.concat(chunk) : chunk;

          if (chunk.text) {
            finalText += chunk.text;
            onEvent({ type: "text_delta", text: chunk.text });
          }
        }
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";

        // "Request too large" (HTTP 413): shrink older tool output a lot and try again.
        const tooLarge = (err as { status?: number }).status === 413 || msg.includes("request too large");
        if (tooLarge && attempt < 2) {
          response = undefined;
          compactToolOutputs(messages, 1, 300);
          continue;
        }

        // Rate limit with a short wait ("try again in 8.4s"): wait it out and retry quietly.
        // Free tiers hit this often, and a few seconds of waiting beats a failed run.
        const status = (err as { status?: number }).status;
        const waitMatch = msg.match(/try again in ([\d.]+)s/);
        const waitSeconds = waitMatch ? Number(waitMatch[1]) : NaN;
        if (status === 429 && waitSeconds <= 20 && attempt < 2) {
          response = undefined;
          await new Promise((r) => setTimeout(r, (waitSeconds + 0.5) * 1000));
          continue;
        }

        // Invented tool name, or a malformed tool call the provider could not parse.
        const recoverable =
          msg.includes("tool call validation failed") ||
          msg.includes("not in request.tools") ||
          msg.includes("parsing failed") ||
          msg.includes("failed_generation");
        if (!recoverable || attempt >= 2) throw err;

        response = undefined;
        messages.push(
          new HumanMessage(
            `Use only these exact tool names: ${tools.map((t) => t.name).join(", ")}. Continue answering the user.`
          )
        );
      }
    }

    if (!response) {
      throw new Error("The model returned an empty response");
    }

    messages.push(response);

    const toolCalls = response.tool_calls ?? [];

    // No tool calls means the model is done answering.
    // After the limit we stopped offering tools, so anything left is the final answer.
    if (toolCalls.length === 0 || limitReached) {
      return finalText || "I could not finish within the tool limit. Please try a more specific question.";
    }

    for (const call of toolCalls) {
      toolCallCount++;

      if (toolCallCount > maxToolCalls) {
        limitReached = true;
        // Every tool call in the last reply needs an answer, or the next request is invalid.
        messages.push(
          new ToolMessage({
            content: "Tool limit reached. Answer the user now using the information you already have.",
            tool_call_id: call.id ?? call.name,
          })
        );
        continue;
      }

      onEvent({ type: "tool_started", tool: call.name, input: call.args });

      const matchedTool = tools.find((t) => t.name === call.name);
      let output = "Tool not found";

      if (matchedTool) {
        try {
          output = String(await matchedTool.invoke(call.args));
        } catch (err) {
          output = err instanceof Error ? err.message : "Tool failed";
        }
      }

      // Web pages and search results can be huge. Big tool output blows through token-per-minute
      // limits (free tiers are about 8k), so we cap what goes back to the model and to the UI.
      if (output.length > MAX_TOOL_OUTPUT_CHARS) {
        output = output.slice(0, MAX_TOOL_OUTPUT_CHARS) + "\n…[output shortened]";
      }

      onEvent({ type: "tool_completed", tool: call.name, output });

      messages.push(
        new ToolMessage({
          content: output,
          tool_call_id: call.id ?? call.name,
        })
      );
    }
  }
}
