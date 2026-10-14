import { wrapMongoError } from "@/lib/errors/database";
import { connectMongo } from "@/lib/mongodb/client";

/**
 * Ensures MongoDB is connected before running data access.
 * Connection is cached globally — safe to call on every request.
 */
export async function withDb<T>(operation: () => Promise<T>): Promise<T> {
  try {
    await connectMongo();
    return await operation();
  } catch (error) {
    throw wrapMongoError(error);
  }
}
