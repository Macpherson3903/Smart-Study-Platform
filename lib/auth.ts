import "server-only";
import { auth } from "@clerk/nextjs/server";

export async function getOptionalUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }
  return userId;
}
