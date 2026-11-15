import { describe, expect, it } from "vitest";
import { githubDefaultsNote, resolveRepo } from "@/features/tools/services/github/githubClient.service";

const none = { owner: "", repo: "" };

describe("resolveRepo", () => {
  it("uses owner and repo as typed", () => {
    expect(resolveRepo({}, { owner: "singhayush007", repo: "AGENT_FORGE" })).toEqual({
      owner: "singhayush007",
      repo: "AGENT_FORGE",
    });
  });

  it("understands a full GitHub URL in the repo field", () => {
    expect(resolveRepo({}, { ...none, repo: "https://github.com/singhayush007/AGENT_FORGE" })).toEqual({
      owner: "singhayush007",
      repo: "AGENT_FORGE",
    });
    expect(resolveRepo({}, { ...none, repo: "https://github.com/o/r.git" })).toEqual({ owner: "o", repo: "r" });
  });

  it("understands owner/repo", () => {
    expect(resolveRepo({}, { ...none, repo: "vercel/next.js" })).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("lets the model override the defaults", () => {
    expect(resolveRepo({ owner: "a", repo: "b" }, { owner: "x", repo: "y" })).toEqual({ owner: "a", repo: "b" });
  });
});

describe("githubDefaultsNote", () => {
  it("tells the model the default repo, even when it was saved as a URL", () => {
    const note = githubDefaultsNote({ repo: "https://github.com/singhayush007/AGENT_FORGE" });
    expect(note).toContain("singhayush007/AGENT_FORGE");
    expect(note).toMatch(/my repo/i);
  });

  it("includes the default PR and stays empty when nothing is set", () => {
    expect(githubDefaultsNote({ owner: "a", repo: "b", defaultPrNumber: "42" })).toContain("42");
    expect(githubDefaultsNote({ owner: "", repo: "" })).toBe("");
    expect(githubDefaultsNote(undefined)).toBe("");
  });
});
