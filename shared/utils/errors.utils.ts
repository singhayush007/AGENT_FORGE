// In production Next hides server-action error text behind a generic message.
// We show that as a friendly fallback instead of leaking framework wording.
export function friendlyMessage(error: Error) {
  const msg = error.message ?? "";
  if (!msg || msg.includes("Server Components render") || msg.includes("fetch failed")) {
    return "Something went wrong. Check your connection and try again.";
  }
  return msg;
}
