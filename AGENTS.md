# AGENTS.md

Guidance for AI coding agents (Cursor, Claude Code, Codex, etc.) working in
this repository.

This file mirrors the human-facing [CONTRIBUTING.md](./CONTRIBUTING.md) and
[docs/design-system.md](./docs/design-system.md). If anything here conflicts
with those, they win.

## Ground rules

1. Read the relevant docs before changing code. Start with
   [docs/architecture.md](./docs/architecture.md).
2. Never commit secrets. `.env.local` is git-ignored; do not check in real
   keys to `.env.example`.
3. Keep diffs minimal and focused. One concern per PR.
4. Match existing code style; don't reformat unrelated files.
5. If you add a dependency, pick the latest stable version and note why in
   the PR description.

## Where things live

- Routes & API: `app/**`
- Shared UI primitives: `components/ui/*`
- Feature components: `components/features/<domain>/*`
- Client-only hooks: `hooks/*`
- Shared utilities: `lib/*`
- Server-only services: `server/services/*`
- Server-only repositories: `server/repositories/*`
- MongoDB document types: `models/*`
- Docs: `docs/*`

## Patterns to follow

- Server components by default; add `"use client"` only when the file uses
  state, effects, or browser APIs.
- Validate untrusted input with `zod` at every API boundary.
- Scope every database query to `userId` at the repository layer.
- Use `cn()` from `lib/cn.ts` to compose class names; don't concat strings
  manually.
- Feedback surfaces, in priority order: `error.tsx` boundary, `<Alert>`
  inline, `toast.*`, field-level message. Pick the right one — see the
  "Feedback UX" section of [CONTRIBUTING.md](./CONTRIBUTING.md).
- When you add a feature, also add its test next to the source file.

## Patterns to avoid

- No hand-rolled `<button className="h-10 rounded-md bg-brand-600 …">`. Use
  `Button` or `ButtonLink` from `components/ui`.
- No hand-rolled `<input className="h-10 rounded-md border …">`. Use
  `Input`, `Textarea`, or `SearchInput`.
- No global client store (no Redux, no Zustand). State either lives on the
  server, in the URL, or per-feature.
- No `any`. Use `unknown` and narrow.
- No green success banners. Success is a toast.
- No toasts for form validation. Validation is a field message.
- No `gray-*` Tailwind colors. Use `slate-*`.
- No `text-base`. Stick to the four sizes in
  [docs/design-system.md](./docs/design-system.md).

## Before finishing a task

Run all four:

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
```

If any fail, fix them before returning control. CI enforces the same four.

## Commit messages

Conventional Commits, e.g. `feat(search): add text index over summary`. See
[CONTRIBUTING.md](./CONTRIBUTING.md#commits) for allowed types.

## What to ask the user

When the request is ambiguous, ask for clarification before editing. In
particular:

- "Should this live in `components/ui/` (shared) or
  `components/features/<domain>/` (feature-scoped)?"
- "Is this a v1 feature or a future stub?" (Phase 6 left filters as stubs on
  purpose.)
- "Do you want a toast or an inline `<Alert>` here?"
