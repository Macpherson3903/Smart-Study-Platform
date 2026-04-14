import "server-only";

import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = env.MONGODB_URI();

  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri);
    global.__mongoClientPromise = client.connect();
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
