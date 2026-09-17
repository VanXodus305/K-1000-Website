import { MongoServerError } from "mongodb";
import { getMongoDb } from "./mongodb";

export const STRICT_RATE_LIMIT = 3;
export const STRICT_RATE_WINDOW_MS = 60_000;
export const DEVICE_COOKIE_NAME = "ignithon_device_id";

type RateLimitDocument = { key: string; count: number; resetAt: Date; expiresAt: Date };

let indexPromise: Promise<void> | undefined;

async function getRateLimitCollection() {
  const collection = (await getMongoDb()).collection<RateLimitDocument>("ignithon-rate-limits");
  indexPromise ??= Promise.all([
    collection.createIndex({ key: 1 }, { unique: true, name: "unique_rate_limit_key" }),
    collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "rate_limit_expiry" }),
  ]).then(() => undefined);
  await indexPromise;
  return collection;
}

export async function checkRateLimit(key: string, limit = 30, windowMs = 60_000) {
  const collection = await getRateLimitCollection();
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const updated = await collection.findOneAndUpdate(
      { key, resetAt: { $gt: now }, count: { $lt: limit } },
      { $inc: { count: 1 } },
      { returnDocument: "after" },
    );
    if (updated) return true;

    try {
      const started = await collection.updateOne(
        { key, $or: [{ resetAt: { $lte: now } }, { resetAt: { $exists: false } }] },
        { $set: { count: 1, resetAt, expiresAt: resetAt } },
        { upsert: true },
      );
      if (started.modifiedCount || started.upsertedCount) return true;
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    }
  }

  return false;
}

export async function isRateLimited(key: string, limit = 30) {
  const collection = await getRateLimitCollection();
  const current = await collection.findOne({ key, resetAt: { $gt: new Date() } }, { projection: { count: 1 } });
  return Boolean(current && current.count >= limit);
}

export async function recordRateLimitFailure(key: string, limit = 30, windowMs = 60_000) {
  const collection = await getRateLimitCollection();
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const updated = await collection.findOneAndUpdate(
      { key, resetAt: { $gt: now }, count: { $lt: limit } },
      { $inc: { count: 1 } },
      { returnDocument: "after" },
    );
    if (updated) return true;

    try {
      const started = await collection.updateOne(
        { key, $or: [{ resetAt: { $lte: now } }, { resetAt: { $exists: false } }] },
        { $set: { count: 1, resetAt, expiresAt: resetAt } },
        { upsert: true },
      );
      if (started.modifiedCount || started.upsertedCount) return true;
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    }
  }

  return false;
}

export function getClientDeviceId(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value && /^[a-zA-Z0-9-]{16,128}$/.test(value) ? value : null;
}

export function checkStrictRateLimit(key: string) {
  return checkRateLimit(key, STRICT_RATE_LIMIT, STRICT_RATE_WINDOW_MS);
}

export function isStrictRateLimited(key: string) {
  return isRateLimited(key, STRICT_RATE_LIMIT);
}

export function recordStrictRateLimitFailure(key: string) {
  return recordRateLimitFailure(key, STRICT_RATE_LIMIT, STRICT_RATE_WINDOW_MS);
}

export function rateLimitResponse(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(STRICT_RATE_WINDOW_MS / 1000) },
  });
}
