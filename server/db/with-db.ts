import { connectMongo } from "@/lib/mongodb/client";

/**
 * Ensures MongoDB is connected before running data access.
 * Connection is cached globally — safe to call on every request.
 */
export async function withDb<T>(operation: () => Promise<T>): Promise<T> {
  await connectMongo();
  return operation();
}
