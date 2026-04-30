# Production Launch Playbook

This playbook is the source of truth for launching Smart Study Platform on
Vercel.

## 1) Required Environment Variables (Vercel Production)

Set these in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FLUTTERWAVE_DONATION_URL`

Recommended:

- `MONGODB_DB` (defaults to `smart-study`)
- `GEMINI_MODEL`
- `GENERATE_BURST_LIMIT`
- `GENERATE_BURST_WINDOW_SECONDS`
- `GENERATE_DAILY_LIMIT`

## 2) Provider Configuration

### Clerk

- Add production domain(s) under allowed origins/redirects.
- Confirm sign-in/sign-up redirect URLs target production domain.

### MongoDB Atlas

- Ensure network access allows Vercel runtime.
- Ensure DB user in `MONGODB_URI` has required permissions on target DB.

### Flutterwave

- Confirm `NEXT_PUBLIC_FLUTTERWAVE_DONATION_URL` is the live hosted checkout
  link.

## 3) Pre-Promotion Checks (Preview First)

Run before promoting to production:

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
npm run build
```

## 4) Smoke Test Checklist (Preview + Production)

1. Visit `/api/health` and verify `ok: true` and all checks are `ok: true`.
2. Sign up a new account and confirm dashboard access.
3. Sign in existing account and confirm dashboard access.
4. Generate a new session and confirm results render.
5. Open flashcards and practice routes for a generated session.
6. Confirm support prompt appears:
   - after auth entry, and
   - after every 2 completed sessions.
7. Click support CTA and confirm redirect to Flutterwave checkout URL.
8. Save settings and verify persistence after refresh.
9. Submit feedback and verify success path.

## 5) Observability During Soft Launch (24-48h)

Monitor Vercel logs for:

- `/api/generate`
- `/api/sessions/*`
- `/api/support/prompt`
- `/api/support/prompt/ack`
- `/api/health`

Trigger investigation if:

- repeated `5xx` responses,
- sustained rate-limit spikes,
- auth failures after deploy,
- checkout redirects failing.

## 6) Rollback Procedure

1. In Vercel, open Deployments.
2. Select last known good production deployment.
3. Promote it to Production.
4. Re-run smoke tests and verify `/api/health`.

## 7) Go / No-Go Gate

Launch only when all are true:

- required env vars configured in production,
- `/api/health` fully green,
- smoke tests pass end-to-end,
- quality checks pass on release commit,
- no high-severity runtime log regressions in soft-launch window.
