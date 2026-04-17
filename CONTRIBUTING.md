# Contributing to Smart Study Platform

Thanks for your interest in contributing. This guide gets you from a fresh
clone to a merged PR.

## Quick start

Prerequisites: Node.js 20+, a MongoDB Atlas cluster (free tier works), a
Google AI Studio API key, and a Clerk project.

```bash
git clone https://github.com/Macpherson3903/Smart-Study-Platform.git
cd Smart-Study-Platform
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Health check: `GET http://localhost:3000/api/health`

## Development workflow

Before opening a PR, all four of these must pass locally:

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # Vitest
npm run format:check  # Prettier
```

If `format:check` fails, run `npm run format` to auto-fix.

CI (`.github/workflows/ci.yml`) runs the same four commands on every push.

## Project structure

See [docs/architecture.md](./docs/architecture.md) for the layer map. The
short version:

- `app/` — routes & API handlers
- `components/ui/` — shared primitives (see
  [docs/design-system.md](./docs/design-system.md))
- `components/features/<domain>/` — composed, feature-specific components
- `hooks/` — client-only hooks
- `lib/` — shared utilities
- `models/` — MongoDB document types
- `server/services` / `server/repositories` — business logic & persistence

## Coding conventions

### Files & folders

- Components: `PascalCase.tsx` (e.g. `Button.tsx`, `SessionsList.tsx`)
- Utilities and hooks: `camelCase.ts` (e.g. `cn.ts`, `useDebouncedValue.ts`)
- Docs: `kebab-case.md`
- Route groups: Next.js convention, `(dashboard)`, `(public)`
- Tests colocated next to source: `Button.test.tsx` next to `Button.tsx`

### Components

- Named exports only. The sole exception is Next.js pages/layouts (which
  require a default export).
- Client components start with `"use client"` on line 1; server components
  don't.
- Spread `...rest` to the root element so consumers can pass native HTML attrs.
- Combine class names with `cn()` from `lib/cn.ts`; user-provided `className`
  always wins.
- Props as discriminated unions for mutually exclusive options — see
  `EmptyState`'s `action` prop for the pattern.

### Server code

- Anything importing from `server/` should live behind `"server-only"`.
- Verb-first function names: `listStudySessions`, `findCompleteStudySessionByContentHash`.
- Repositories own their indexes. Always call `ensureStudySessionIndexes()`
  at the top of a service method so first-run deployments converge.
- Never return raw MongoDB documents from a service — map them to the
  `StudySessionListItem` shape (or a similar DTO).

### TypeScript

- `PascalCase` for types. No `I` prefix on interfaces.
- Suffix types with `Props` / `Input` / `Output` only when they need
  disambiguation.
- Avoid `any`. Prefer `unknown` at boundaries and validate with `zod` before
  trusting.

### Styling

See [docs/design-system.md](./docs/design-system.md). Short version:

- Spacing on the 4/8 px grid.
- Four text sizes (`text-2xl`, `text-xl`, `text-sm`, `text-xs`) — that's it.
- `slate-*` for neutrals, never `gray-*`.
- `brand-600` only for primary actions.
- No hand-rolled button or input markup — use `Button`/`ButtonLink`/`Input`.

### Feedback UX

- Form validation → field-level message. Never a toast.
- Blocking feature error → `<Alert>` inline.
- Transient action result (copy, delete, load-more) → `toast.success` / `.error`.
- Render-time crash → `error.tsx` boundary.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/). The type is
required; the scope is optional but encouraged.

```
feat(search): add MongoDB text index over inputText and summary
fix(auth): surface Clerk session expiry in the error boundary
docs: document the 8px spacing rhythm
chore(deps): bump next to 16.2.4
```

Types we commonly use: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`,
`perf`, `style`.

## Pull requests

Every PR should:

1. Build on `main` (or the latest release branch).
2. Include tests for any logic change.
3. Pass `lint`, `typecheck`, `test`, and `format:check`.
4. Update `docs/` if you change a cross-cutting contract (design tokens,
   API shape, folder layout).
5. Include a screenshot or short clip for UI changes.

The PR template will walk you through these.

## Reporting bugs & requesting features

Use the issue templates in `.github/ISSUE_TEMPLATE/`. For security issues,
**do not** open a public issue — see [SECURITY.md](./SECURITY.md).

## Code of conduct

This project follows the [Contributor Covenant v2.1](./CODE_OF_CONDUCT.md).
Be kind, be specific, assume good faith.

## License

By contributing, you agree that your contributions will be licensed under the
same [MIT license](./LICENSE) that covers the project.
