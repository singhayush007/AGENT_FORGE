# Environment variables

Copy `.env.example` to `.env` and fill it in. Restart `pnpm dev` after changing it.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (local Postgres, Neon, Prisma Postgres, …). For hosted databases use `?sslmode=verify-full`. |
| `BETTER_AUTH_SECRET` | Yes | Session signing secret. Generate one with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Yes | Public URL of the app (`http://localhost:3000` in development). |
| `GITHUB_CLIENT_ID` | For GitHub login | GitHub OAuth app client id. Callback URL: `<BETTER_AUTH_URL>/api/auth/callback/github`. |
| `GITHUB_CLIENT_SECRET` | For GitHub login | GitHub OAuth app client secret. |
| `OPENAI_API_KEY` | Yes | Key for the model provider that runs the agents. Any OpenAI-compatible key works (OpenAI, Groq, Gemini, OpenRouter, …). |
| `OPENAI_BASE_URL` | No | Base URL of an OpenAI-compatible provider, e.g. `https://api.groq.com/openai/v1`. Empty = OpenAI. |
| `LLM_MODEL` | No | Overrides the model id for every agent, e.g. `openai/gpt-oss-120b` on Groq. Empty = use the agent's model. |
| `TAVILY_API_KEY` | No | Enables the **Web Search** tool ([tavily.com](https://tavily.com), free tier available). |

## Free provider examples

```bash
# Groq (free tier, tool calling works)
OPENAI_API_KEY="gsk_..."
OPENAI_BASE_URL="https://api.groq.com/openai/v1"
LLM_MODEL="openai/gpt-oss-120b"

# Google Gemini (OpenAI-compatible endpoint)
OPENAI_API_KEY="AIza..."
OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
LLM_MODEL="gemini-2.5-flash"
```

Free tiers have token-per-minute limits. The runtime waits and retries short rate limits automatically, and caps tool
output so one web page cannot use up the whole budget.

## What needs which key

| Feature | Needs |
| --- | --- |
| Sign in with email | `DATABASE_URL`, `BETTER_AUTH_SECRET` |
| Sign in with GitHub, GitHub tools | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Chat, Improve with AI | `OPENAI_API_KEY` (+ `OPENAI_BASE_URL` / `LLM_MODEL` for other providers) |
| Web Search tool | `TAVILY_API_KEY` |
| Weather, Wikipedia, Currency, Hacker News, Date & Time, Calculator | nothing (free public APIs) |
