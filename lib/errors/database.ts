import mongoose from "mongoose";

import { DB_UNAVAILABLE_CODE } from "@/lib/errors/codes";

export { DB_UNAVAILABLE_CODE };

export class DatabaseUnavailableError extends Error {
  readonly code = DB_UNAVAILABLE_CODE;

  constructor(message = "Cannot reach the database. Check MONGODB_URI and network access.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function isDatabaseUnavailableError(
  error: unknown,
): error is DatabaseUnavailableError {
  return (
    error instanceof DatabaseUnavailableError ||
    (error instanceof Error && error.name === "DatabaseUnavailableError")
  );
}

export function wrapMongoError(error: unknown): Error {
  if (isDatabaseUnavailableError(error)) {
    return error;
  }

  if (
    error instanceof mongoose.mongo.MongoServerSelectionError ||
    error instanceof mongoose.mongo.MongoNetworkError ||
    (error instanceof Error &&
      (error.message.includes("MongoServerSelectionError") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ETIMEDOUT")))
  ) {
    return new DatabaseUnavailableError(
      error instanceof Error ? error.message : undefined,
    );
  }

  return error instanceof Error ? error : new Error(String(error));
}
