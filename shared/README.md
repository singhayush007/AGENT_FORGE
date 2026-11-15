# shared/

Code used by **two or more features**. Nothing in here may import from `features/` or `app/` (enforced by ESLint).

| Folder | What lives here |
| --- | --- |
| `components/` | App-wide UI: `AppIcon`, `Logo`, `PageHeader`, `ErrorState`, and `ui/` (shadcn/ui, kept in its generated kebab-case names) |
| `providers/` | React providers mounted in the root layout: `Provider`, `QueryProvider`, `ThemeProvider` |
| `lib/` | Infrastructure: `db` (Prisma), `auth` (Better Auth server), `authClient`, `utils` (`cn`), `iconMap`; `generated/` is the Prisma client (git-ignored) |
| `types/` | Domain types and Zod schemas: `workflow.types` (graph), `agentDefinition.types` (v1 agent) |
| `utils/` | Pure helpers: `tools.utils` (tool catalog and labels), `customTool.utils`, `workflowMigrate.utils`, `validateGraph.utils`, `errors.utils` |

Rules:

- Move code here only when a second feature needs it. Until then it stays inside its feature.
- Keep it free of product screens. Screens belong in `features/<name>/views`.
- Add a unit test (`*.test.ts`) next to pure logic.
