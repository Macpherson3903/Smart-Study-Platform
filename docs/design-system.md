# Design System

Phase 6 locks in the visual language for Smart Study Platform. This doc is the
single source of truth for layout, typography, color, and the shared UI
primitives in `components/ui/`. If you're building a new screen or feature,
start here.

Goal: a clean, minimal, Notion-adjacent SaaS look with zero visual clutter.

## Spacing — the 8px rhythm

We use Tailwind's default scale. Everything below is in `rem` /`px`; all values
are multiples of 4px (half-step) or 8px (full-step).

| Token                     | Use                                                       |
| ------------------------- | --------------------------------------------------------- |
| `px-4 sm:px-6`            | Page gutter (set inside `DashboardShell`)                 |
| `space-y-6`               | Vertical rhythm between cards on a page                   |
| `space-y-10`              | Vertical rhythm between major sections on the dashboard   |
| `p-4`                     | Default `Card` internal padding                           |
| `gap-3` / `gap-2`         | Buttons in a row (`gap-3` preferred, `gap-2` on toolbars) |
| Button heights: `36 / 40` | `size="sm"` / `size="md"` in `Button`                     |

Rules:

- Never hand-roll `px-5` or `py-7`. Stay on the 4px grid.
- Don't ship `space-y-8` — reach for 6 or 10.
- Don't nest scroll containers inside cards; use the page scroll.

## Typography

Four levels. System font stack, no web font.

| Class                                           | Use                                 |
| ----------------------------------------------- | ----------------------------------- |
| `text-2xl font-semibold tracking-tight`         | Page H1 ("Welcome back, Alex")      |
| `text-xl font-semibold tracking-tight`          | Page H2 / section header            |
| `text-sm font-semibold text-slate-900`          | Card title, field label             |
| `text-sm text-slate-600`                        | Body / description                  |
| `text-xs text-slate-500`                        | Metadata, timestamps                |
| `text-xs font-semibold uppercase tracking-wide` | Eyebrow ("Front" / "Back" on cards) |

Do:

- Use `text-pretty` or `text-balance` on headings.
- Use `font-semibold` for titles; avoid `font-bold`.
- Truncate long text with `truncate` or `line-clamp-{n}`, not manual substring.

Don't:

- Don't introduce `text-base`. It's not used anywhere and breaks the rhythm.
- Don't mix `text-gray-*` with `text-slate-*`. We are slate-only.

## Color

Brand palette is sky (`--color-brand-*`) and accent is yellow
(`--color-accent-*`). See `app/globals.css` for the full scale.

| Color       | Use                                                              |
| ----------- | ---------------------------------------------------------------- |
| `brand-600` | Primary actions (buttons, active tabs) — **only**                |
| `brand-50`  | Subtle hover backgrounds on interactive rows / links             |
| `brand-200` | Borders of "secondary" branded states (tinted secondary buttons) |
| `slate-900` | Primary text, headings                                           |
| `slate-700` | Body text                                                        |
| `slate-600` | Secondary body text / descriptions                               |
| `slate-500` | Metadata, placeholders                                           |
| `slate-200` | Default borders, dividers                                        |
| `slate-50`  | Page background                                                  |
| `red-*`     | Destructive actions, hard errors                                 |
| `amber-*`   | Auth / configuration warnings (e.g. missing env var)             |
| `emerald-*` | **Reserved** for flashcard "I Know This" only                    |

Rules:

- No raw `gray-*`. Use `slate-*`.
- No arbitrary hex colors in components. Add a brand token in
  `app/globals.css` if a new color is genuinely needed.
- Every foreground/background pair must clear WCAG AA contrast. Lint via
  `eslint-plugin-jsx-a11y` (bundled with `eslint-config-next`).
- Success is conveyed via toast + checkmark, never a persistent green block.

## Shadows & radius

- Borders beat shadows. Use `border border-slate-200` as the default
  separator. Only add `shadow-sm` when a card is floating above a peer
  (e.g. hover state, toast).
- Radius: `rounded-md` (buttons, inputs, alerts), `rounded-lg` (toasts),
  `rounded-xl` (cards). No `rounded-2xl` in UI primitives.

## Focus

Every interactive element must show a visible focus ring:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20
```

Branded focus (for elements inside a brand-tinted surface):

```
focus-visible:ring-2 focus-visible:ring-brand-500/25
```

## UI primitives (`components/ui/`)

Folder stays flat — one file per primitive. Nested folders are overkill at
this scale.

| Primitive     | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| `Alert`       | Tonal inline message block (error/warning/info/success)     |
| `Badge`       | Small pill for statuses                                     |
| `Button`      | Primary interactive element (4 variants, 2 sizes)           |
| `ButtonLink`  | `next/link` that matches `Button` styling                   |
| `Card`        | Surface container (`Card`, `CardHeader`, `CardContent`)     |
| `EmptyState`  | Empty zone with title/description/action/secondaryAction    |
| `Input`       | Single-line text field                                      |
| `SearchInput` | Single-line search field with icon + clear button           |
| `Skeleton`    | Loading placeholder block                                   |
| `Spinner`     | Indeterminate loading indicator (also used inside `Button`) |
| `Switch`      | Boolean toggle                                              |
| `Tabs`        | Headless-style tabs (`Tabs`, `TabsList`, `TabsTrigger`, …)  |
| `Textarea`    | Multi-line text field                                       |
| `Toaster`     | Project-configured `sonner` mount point                     |

Deferred until genuinely needed (don't build them speculatively):
`DropdownMenu`, `Dialog`, `Chip`. When these land, pull from Radix UI to get
focus trapping for free.

## Props design rules

- Spread `...rest` to the root element for native-attribute passthrough.
- `className` last, combined via `cn()` from `lib/cn.ts`, so consumers can
  override.
- Variants are string unions (`variant: "primary" | "secondary"`), never
  boolean flags (`primary?: boolean`).
- Sizes: only `"sm" | "md"`. Add `"lg"` only when a real product need appears.
- Prefer `children` over `label` props for composability.
- Discriminated unions for action props — for example, `EmptyState`'s `action`
  accepts `{ href }` or `{ onClick }`, never both.

## Avoiding duplication

- Don't hand-roll `<button className="h-10 rounded-md bg-brand-600 …">`. Use
  `Button` or `ButtonLink`.
- Don't hand-roll `<input className="h-10 rounded-md border …">`. Use
  `Input`, `Textarea`, or `SearchInput`.
- Need a styled anchor for an external URL? Use `ButtonLink`'s sibling
  pattern — or, if it's a text link, the `text-slate-700 hover:underline`
  utility is fine.

## Feedback surfaces

| Surface                    | Used for                                                 |
| -------------------------- | -------------------------------------------------------- |
| Route `error.tsx` boundary | Render-time crashes, server errors, DB/Gemini misconfig  |
| `Alert`                    | Feature-scoped, blocking errors (inline on a page)       |
| `toast.error` / `.success` | Transient, non-blocking feedback (copy, delete, refresh) |
| Field-level message        | Client-side validation only                              |

**Never**:

- Show a toast for form validation (use a field message).
- Show a toast for a route crash (use `error.tsx`).
- Render green success banners (use a toast).

## Accessibility checklist (per component)

- Keyboard reachable and activatable with Enter/Space.
- Visible focus ring.
- Announces role where non-obvious (`role="alert"` on error alerts, `role="tab"`
  on tab triggers, etc.).
- Icons decorating text are `aria-hidden="true"`.
- Any icon-only button has an `aria-label`.
