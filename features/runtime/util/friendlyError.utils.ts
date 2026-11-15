// Turns raw provider / network errors into short messages a user can act on.
// The raw error is logged on the server only, so keys and URLs never reach the browser.

type ErrorLike = { status?: number; code?: string; name?: string; message?: string };

export function toFriendlyError(err: unknown): string {
  const e = (err ?? {}) as ErrorLike;
  const msg = (e.message ?? "").toLowerCase();
  const status = e.status;

  console.error("[agent run failed]", err);

  if (msg.includes("openai_api_key")) {
    return "The AI provider key is missing. Add OPENAI_API_KEY to .env and restart the server.";
  }
  if (status === 401 || msg.includes("incorrect api key") || msg.includes("invalid_api_key") || msg.includes("invalid api key")) {
    return "The AI provider rejected the API key. Check OPENAI_API_KEY in .env.";
  }
  if (status === 429 || msg.includes("rate limit") || msg.includes("rate_limit")) {
    return "The AI provider is rate-limiting requests. Wait a few seconds and try again.";
  }
  if (msg.includes("model_not_found") || (status === 404 && msg.includes("model"))) {
    return "That model is not available on your AI provider. Pick another model in the agent settings.";
  }
  if (e.name === "AbortError" || e.name === "TimeoutError" || msg.includes("timed out") || msg.includes("timeout")) {
    return "The run took too long and was stopped. Try a simpler request.";
  }
  if (
    msg.includes("tool call validation failed") ||
    msg.includes("not in request.tools") ||
    msg.includes("parsing failed") ||
    msg.includes("failed_generation")
  ) {
    return "The AI model produced an invalid tool call. Please try again, or switch to a different model.";
  }
  if (msg.includes("too many tool calls")) {
    return "The agent used too many tools for this request. Try asking something more specific.";
  }
  if (msg.includes("fetch failed") || msg.includes("econnrefused") || msg.includes("enotfound") || msg.includes("network")) {
    return "Could not reach the AI provider. Check your internet connection and try again.";
  }
  if (typeof status === "number" && status >= 500) {
    return "The AI provider had a problem. Please try again in a moment.";
  }

  return "Something went wrong while running the agent. Please try again.";
}
