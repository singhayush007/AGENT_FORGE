@AGENTS.md

# AgentForge: conventions

File naming is **PascalCase** and the file name is **the main thing the file exports**. This applies to components,
views and hooks:

- Components / views: `AgentCard.tsx` exports `AgentCard`, `AgentsPage.tsx` exports `AgentsPage`.
- Hooks: `UseAgents.ts` exports `useAgents` (PascalCase file, `use…` export).
- Everything else uses a suffix that says what it is: `agent.actions.ts` (server actions), `chatStream.service.ts`,
  `template.types.ts`, `templates.constants.ts`, `errors.utils.ts`, `weather.tool.ts` (agent tools),
  `canvasStore.ts` (zustand store).
- Exceptions: Next.js route files (`page.tsx`, `layout.tsx`, `route.ts`, …) and the shadcn/ui files in
  `shared/components/ui/` keep their framework names (shadcn regenerates them in kebab-case).

## Architecture

```
app/                 Routes only (Next.js App Router). Pages stay thin: route -> features/<x>/views/XPage
  (public)/          Landing, login, signup, shared-agent page (no session needed)
  (private)/         Signed-in app: agents, builder, chat, analytics (layout calls requireAuth)
  api/               Route handlers: agent runs, public share runs, AI helper, Better Auth
features/<name>/     One folder per product feature
  views/             Page components (what a route renders)
  components/        Feature-private UI
  hooks/             Feature hooks (TanStack Query, effects)
  actions/           Server actions ("use server"): the data-access layer for the client
  services/          Server-side logic and fetch calls (runtime, tools, streaming client)
  store/             Feature zustand stores
  constants/ types/ util/
shared/              Used by 2+ features
  components/        AppIcon, Logo, PageHeader, ErrorState, ui/ (shadcn)
  providers/         Root-layout providers (React Query, theme)
  lib/ types/ utils/ lib/ holds db, auth, authClient, cn(); lib/generated is the Prisma client
  (see shared/README.md)
prisma/              Schema + migrations
docs/                ENV_REFERENCE.md, screenshots/
```

Dependency direction (enforced by ESLint `no-restricted-imports` in `eslint.config.mjs`):

```
app  ->  features  ->  shared
```

- `shared/` never imports `features/` or `app/`.
- Features never import `app/`, and import each other only along the explicit edges listed in `eslint.config.mjs`
  (`agents -> auth, playground`, `builder -> agents, playground`, `dashboard -> agents, auth`, `landing -> agents`,
  `playground -> auth`, `analytics -> auth`, `runtime -> tools`). No cycles.
- Code needed by two features moves to `shared/` (that is why the workflow schema, `validateGraph`, the tool catalog, the agent
  definition types and `friendlyMessage` live there).
- A feature that needs something from a sibling it must not import takes it as a prop or callback instead
  (example: `ChatPanel` receives `getDefinition` from the builder, so `playground` never imports `builder`).

Rules of thumb:

- Server data -> TanStack Query in a feature hook that calls an `*.actions.ts` function. Client state -> zustand.
- Components never talk to Prisma. Only `actions/`, `services/` and `app/api/**/route.ts` do.
- Every server action and route handler checks the session (`requireAuth()` / `auth.api.getSession`) and filters by
  `userId`. The public share route is the one exception and has its own limits (see `app/api/share`).
- Import across the app with the `@/` alias (`@/shared/...`, `@/features/...`).
- Raw provider errors never reach the browser: wrap them with `toFriendlyError` (`features/runtime/util`).
- TypeScript is `strict`. Run `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm knip` before you push; CI also runs `pnpm build`.
- Pure logic gets a Vitest test next to it (`*.test.ts`).
- No dead code: `pnpm knip` must stay clean (unused files, exports and dependencies). Delete what is not used.
- After changing `prisma/schema.prisma`: add a migration, run `pnpm exec prisma generate`, and **restart `pnpm dev`**
  (the dev server keeps the old client in memory).
