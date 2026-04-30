# Smoke Test Report Template

Use this checklist for each preview deploy and the production launch candidate.

## Deployment

- Environment: `preview` / `production`
- URL:
- Commit SHA:
- Tester:
- Date:

## Health

- [ ] `GET /api/health` returns `200`
- [ ] every `checks[*].ok` is `true`

## Auth

- [ ] Sign up succeeds and lands in dashboard
- [ ] Sign in succeeds and lands in dashboard
- [ ] Protected route redirects unauthenticated users

## Core Product

- [ ] Generate study session succeeds
- [ ] Session results render
- [ ] Flashcards page works
- [ ] Practice page works
- [ ] Settings update persists after refresh

## Support Prompt + Donate

- [ ] Prompt appears on auth entry
- [ ] Prompt appears again after 2 completed sessions
- [ ] Support CTA redirects to configured checkout URL
- [ ] `/donate` CTA points to expected checkout URL

## Feedback

- [ ] Feedback submission succeeds
- [ ] Feedback list/testimonials route behaves as expected

## Notes / Defects

- Severity:
- Repro steps:
- Logs attached:

## Result

- [ ] PASS (launch candidate approved)
- [ ] FAIL (block promotion)
