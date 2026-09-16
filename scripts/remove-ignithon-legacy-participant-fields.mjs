import { writeFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

const apply = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "k1000";
if (!uri) throw new Error("MONGODB_URI is not configured");

const client = new MongoClient(uri);
await client.connect();

try {
  const participants = client.db(dbName).collection("ignithon-participants");
  const legacy = await participants.find(
    { $or: [{ qr_separator: { $exists: true } }, { is_kiit_student: { $exists: true } }] },
    { projection: { _id: 1 } },
  ).toArray();

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", legacyParticipantDocuments: legacy.length }));
  if (!apply || !legacy.length) process.exitCode = legacy.length ? 2 : 0;
  if (apply && legacy.length) {
    const backupPath = `/tmp/ignithon-legacy-fields-backup-${Date.now()}.json`;
    await writeFile(backupPath, JSON.stringify({ participantIds: legacy.map(({ _id }) => _id.toHexString()) }, null, 2), { mode: 0o600 });
    await participants.updateMany(
      { _id: { $in: legacy.map(({ _id }) => _id) } },
      { $unset: { qr_separator: "", is_kiit_student: "" } },
    );
    try { await participants.dropIndex("unique_participant_qr_separator"); } catch (error) {
      if (!(error instanceof Error) || !/index not found/i.test(error.message)) throw error;
    }
    console.log(JSON.stringify({ migrated: true, removedFields: ["qr_separator", "is_kiit_student"], backupPath }));
  }
} finally {
  await client.close();
}
