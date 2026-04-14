export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">
        Smart Study Platform
      </h1>
      <p className="mt-3 text-balance text-slate-600">
        Phase 0 foundation is ready. Next steps: auth (Clerk), persistence
        (MongoDB), and the session API.
      </p>
    </main>
  );
}
