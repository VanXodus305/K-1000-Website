import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "k1000";

if (!uri && process.env.NODE_ENV === "production") {
  console.warn("MONGODB_URI is not configured; Ignithon persistence is unavailable.");
}

declare global {
  // eslint-disable-next-line no-var
  var __k1000MongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not configured");

  const clientPromise = global.__k1000MongoClientPromise ?? new MongoClient(uri).connect();
  global.__k1000MongoClientPromise = clientPromise;
  return (await clientPromise).db(dbName);
}

export async function getMongoClient() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  const clientPromise = global.__k1000MongoClientPromise ?? new MongoClient(uri).connect();
  global.__k1000MongoClientPromise = clientPromise;
  return clientPromise;
}

export async function pingMongoDb() {
  const db = await getMongoDb();
  await db.command({ ping: 1 });
  return { ok: true, database: db.databaseName };
}
