import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toFriendlyError } from "@/features/runtime/util/friendlyError.utils";

const err = (message: string, extra: Record<string, unknown> = {}) =>
  Object.assign(new Error(message), extra);

describe("toFriendlyError", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("explains a missing provider key", () => {
    expect(toFriendlyError(err("Add OPENAI_API_KEY to .env"))).toMatch(/key is missing/i);
  });

  it("maps provider status codes to readable messages", () => {
    expect(toFriendlyError(err("nope", { status: 401 }))).toMatch(/rejected the API key/i);
    expect(toFriendlyError(err("Rate limit reached", { status: 429 }))).toMatch(/rate-limiting/i);
    expect(toFriendlyError(err("boom", { status: 503 }))).toMatch(/provider had a problem/i);
  });

  it("explains a request that is too large for the model", () => {
    expect(toFriendlyError(err("Request too large for model ... TPM", { status: 413 }))).toMatch(/too large/i);
  });

  it("recognises timeouts, network failures and bad tool calls", () => {
    expect(toFriendlyError(err("x", { name: "TimeoutError" }))).toMatch(/took too long/i);
    expect(toFriendlyError(new TypeError("fetch failed"))).toMatch(/could not reach/i);
    expect(toFriendlyError(err("Tool call validation failed: ..."))).toMatch(/invalid tool call/i);
  });

  it("never leaks the raw message (keys, urls) for unknown errors", () => {
    const out = toFriendlyError(err("weird internal sk-abc123secret thing"));
    expect(out).not.toContain("sk-abc123secret");
    expect(out).toMatch(/something went wrong/i);
  });
});
