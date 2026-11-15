export type StreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_started"; tool: string; input: unknown }
  | { type: "tool_completed"; tool: string; output: string }
  | { type: "run_completed"; conversationId: string }
  | { type: "run_failed"; error: string; conversationId?: string };

// Pulls a readable message out of a failed response (JSON { error } or plain text).
async function readError(res: Response) {
  if (res.status === 401) return "Your session expired. Please sign in again.";
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // not JSON
  }
  if (res.status === 404) return "This agent no longer exists.";
  if (res.status >= 500) return "The server hit a problem. Please try again.";
  return `Request failed (${res.status}).`;
}

export async function streamAgentRun(
  agentId: string,
  body: {
    message: string;
    conversationId?: string;
    definition?: unknown;
    regenerate?: boolean;
    history?: { role: string; content: string }[];
  },
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  url?: string
) {
  try {
    const res = await fetch(url ?? `/api/agents/${agentId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok || !res.body) {
      onEvent({ type: "run_failed", error: await readError(res) });
      return;
    }

    let finished = false;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Server-sent events look like "data: {...}\n\n".
      // A network chunk can end in the middle of a line, so we keep the leftover in `buffer`.
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6)) as StreamEvent;
          if (event.type === "run_completed" || event.type === "run_failed") finished = true;
          onEvent(event);
        } catch {
          // ignore a malformed chunk
        }
      }
    }

    // The stream closed without a final event: the connection dropped mid-answer.
    if (!finished) {
      onEvent({ type: "run_failed", error: "The connection was lost before the reply finished. Please try again." });
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    onEvent({ type: "run_failed", error: "Could not reach the server. Please try again." });
  }
}
