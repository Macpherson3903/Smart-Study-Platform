import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run proxy on all routes except Next.js internals and static files.
    "/((?!_next|.*\\..*).*)",
    // Always run on API routes.
    "/api/(.*)",
  ],
};
