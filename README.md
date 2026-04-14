# Smart Study Platform

Smart Study Platform is an AI-powered system that transforms raw academic content into structured, digestible, and interactive learning materials in real time.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Clerk (authentication)
- MongoDB Atlas (database)

## Getting started (local)

### Prerequisites

- Node.js 20+

### Install

```bash
npm install
```

### Environment variables

Copy the template and fill in values:

```bash
copy .env.example .env.local
```

Required:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`

Optional:

- `MONGODB_DB` (defaults to `smart-study`)

### Run

```bash
npm run dev
```

Health check: `GET /api/health`

## Project structure

- `app/`: Next.js routes, layouts, and API route handlers (`app/api/**`)
- `components/`: reusable UI components (`ui/` + `features/`)
- `hooks/`: client-only React hooks
- `lib/`: shared utilities (auth helpers, env parsing, MongoDB client)
- `models/`: persistence contracts (MongoDB document types)
- `server/`: server-only business logic (services + repositories)

## Development workflows

- `npm run lint`: ESLint
- `npm run format`: Prettier write
- `npm run format:check`: Prettier check
- `npm run typecheck`: TypeScript typecheck
