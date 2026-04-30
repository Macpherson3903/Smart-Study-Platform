# Soft Launch Ops Runbook

This runbook covers the first 24-48 hours after production release.

## Monitoring Targets

Monitor Vercel function logs for:

- `/api/generate`
- `/api/sessions`
- `/api/sessions/[id]`
- `/api/support/prompt`
- `/api/support/prompt/ack`
- `/api/health`

## Alert Triggers

Open incident response when any occur:

- repeated `5xx` from any API route,
- sustained `429` rate-limit spikes from `/api/generate`,
- auth-protection failures on dashboard routes,
- checkout redirect failures from support prompt or donate page.

## First Response

1. Confirm issue scope from logs and request path.
2. Check `/api/health` status and check-level errors.
3. Validate env vars in Vercel for missing/incorrect values.
4. Re-test impacted user flow end-to-end.

## Rollback

1. Open Vercel Deployments.
2. Choose last known good deployment.
3. Promote to Production.
4. Re-run smoke tests and `/api/health`.

## Recovery Exit Criteria

- API error rate returns to baseline.
- Health endpoint is fully green.
- Affected user path is verified manually.
