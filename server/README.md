# `server/`

Server-only application logic (no React components).

## Suggested structure

- `server/services/`: use-cases and orchestration (business logic)
- `server/repositories/`: database access and persistence concerns

Route handlers in `app/api/**` should call **services**, not the database directly.
