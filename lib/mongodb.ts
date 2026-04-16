import "server-only";

import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function normalizeMongoConnectionError(err: unknown): Error {
  if (err instanceof Error) {
    if (/bad auth|authentication failed/i.test(err.message)) {
      return new Error(
        "MongoDB authentication failed. Check MONGODB_URI in .env.local (make sure you replaced the <password> placeholder, removed angle brackets, and URL-encoded special characters).",
        { cause: err },
      );
    }

    if (/ENOTFOUND|getaddrinfo/i.test(err.message)) {
      return new Error(
        "MongoDB DNS lookup failed (ENOTFOUND). Verify the Atlas hostname in MONGODB_URI and check your network/DNS (VPN, firewall, or custom DNS can block *.mongodb.net).",
        { cause: err },
      );
    }

    return err;
  }

  return new Error("MongoDB connection failed.", { cause: err });
}

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = env.MONGODB_URI();

  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri);
    global.__mongoClientPromise = client.connect().catch((err) => {
      // If connection fails, allow subsequent requests to retry after a fix.
      global.__mongoClientPromise = undefined;
      throw normalizeMongoConnectionError(err);
    });
  }

  return global.__mongoClientPromise;
}

export async function getMongoClient(): Promise<MongoClient> {
  return await getMongoClientPromise();
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(env.MONGODB_DB());
}
