export type GithubDefaults = {
  owner?: string;
  repo?: string;
  defaultPrNumber?: string;
};

export async function githubFetch(
  token: string,
  path: string,
  accept = "application/vnd.github+json"
) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: text.slice(0, 2000), status: res.status };
  }

  if (accept === "application/vnd.github.diff") {
    const text = await res.text();
    return { diff: text.slice(0, 12000) };
  }

  return res.json();
}

export function parsePrInput(input: string) {
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2], pullNumber: urlMatch[3] };
  }

  if (/^\d+$/.test(input.trim())) {
    return { pullNumber: input.trim() };
  }

  return { pullNumber: input };
}

// Accepts "https://github.com/owner/repo(.git)", "owner/repo", or just "repo".
function parseRepoInput(value: string) {
  const v = value.trim().replace(/\.git$/i, "");
  const m =
    v.match(/github\.com[/:]([^/\s]+)\/([^/\s?#]+)/i) ?? v.match(/^([^/\s]+)\/([^/\s]+)$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

export function resolveRepo(
  args: { owner?: string; repo?: string },
  defaults: GithubDefaults
) {
  const rawRepo = (args.repo || defaults.repo || "").trim();
  const parsed = parseRepoInput(rawRepo);

  return {
    owner: args.owner || parsed?.owner || defaults.owner || "",
    repo: parsed?.repo ?? rawRepo,
  };
}

// The tools fall back to the saved defaults when the model leaves owner/repo out, but the model
// cannot see those defaults. This tells it, so "my repo" / "this repo" just works.
export function githubDefaultsNote(defaults: GithubDefaults | undefined) {
  if (!defaults) return "";
  const { owner, repo } = resolveRepo({}, defaults);
  const lines: string[] = [];

  if (owner && repo) {
    lines.push(
      `Default GitHub repository: ${owner}/${repo}. When the user says "my repo", "this repo" or does not name a repository, use it. You may leave owner and repo out of GitHub tool calls to use this default.`
    );
  }
  if (defaults.defaultPrNumber) {
    lines.push(`Default pull request: ${defaults.defaultPrNumber}.`);
  }
  return lines.join("\n");
}
