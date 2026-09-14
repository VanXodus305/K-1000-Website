import { writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";

const apply = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "k1000";
const separatorAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
if (!uri) throw new Error("MONGODB_URI is not configured");

const client = new MongoClient(uri);
await client.connect();

try {
  const db = client.db(dbName);
  const teams = db.collection("ignithon-teams");
  const participants = db.collection("ignithon-participants");
  const [teamRecords, legacyFieldCount] = await Promise.all([
    teams.find({}).toArray(),
    participants.countDocuments({ is_kiit_student: { $exists: true } }),
  ]);
  const separatorRecords = await participants.find({}, { projection: { _id: 1, qr_separator: 1 } }).toArray();
  const existingSeparators = new Set(separatorRecords.map((participant) => participant.qr_separator).filter((separator) => typeof separator === "string"));
  const separatorMigrations = separatorRecords.filter((participant) => typeof participant.qr_separator !== "string" || !/^[A-Z0-9]{5}$/.test(participant.qr_separator)).map((participant) => {
    let separator = "";
    do {
      const bytes = randomBytes(5);
      separator = Array.from(bytes, (byte) => separatorAlphabet[byte % separatorAlphabet.length]).join("");
    } while (existingSeparators.has(separator));
    existingSeparators.add(separator);
    return { _id: participant._id, separator };
  });

  const migrations = [];
  for (const team of teamRecords) {
    if (!Array.isArray(team.members)) throw new Error(`Team ${team.id} has an invalid members field`);
    if (team.members.every((member) => member instanceof ObjectId)) continue;

    const legacyMembers = [...team.members].sort((left, right) => {
      const leftLeader = left && typeof left === "object" && !(left instanceof ObjectId) && left.role === "leader";
      const rightLeader = right && typeof right === "object" && !(right instanceof ObjectId) && right.role === "leader";
      return Number(rightLeader) - Number(leftLeader);
    });
    const memberIds = [];
    for (const member of legacyMembers) {
      if (member instanceof ObjectId) {
        memberIds.push(member);
        continue;
      }
      if (!member || typeof member.email !== "string") throw new Error(`Team ${team.id} contains an invalid legacy member reference`);
      const participant = await participants.findOne({ team_id: team.id, email: member.email.trim().toLowerCase(), status: "ACTIVE" }, { projection: { _id: 1 } });
      if (!participant) throw new Error(`Team ${team.id} has a member reference without an active participant`);
      memberIds.push(participant._id);
    }
    const uniqueIds = [...new Map(memberIds.map((id) => [id.toHexString(), id])).values()];
    if (uniqueIds.length !== memberIds.length) throw new Error(`Team ${team.id} contains duplicate member references`);
    migrations.push({ team, memberIds: uniqueIds });
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", teams: teamRecords.length, teamsToMigrate: migrations.length, participantFieldsToRemove: legacyFieldCount, participantQrSeparatorsToAdd: separatorMigrations.length }));
  if (!apply) process.exitCode = migrations.length || legacyFieldCount || separatorMigrations.length ? 2 : 0;
  if (apply && (migrations.length || legacyFieldCount || separatorMigrations.length)) {
    const backupPath = `/tmp/ignithon-schema-backup-${Date.now()}.json`;
    await writeFile(backupPath, JSON.stringify({
      teams: migrations.map(({ team }) => ({ _id: team._id.toHexString(), id: team.id, members: team.members })),
      participantsWithLegacyField: await participants.find({ is_kiit_student: { $exists: true } }, { projection: { _id: 1, is_kiit_student: 1 } }).toArray(),
      participantsWithoutQrSeparator: separatorMigrations.map((participant) => ({ _id: participant._id.toHexString() })),
    }, null, 2), { mode: 0o600 });

    if (migrations.length) {
      await teams.bulkWrite(migrations.map(({ team, memberIds }) => ({
        updateOne: { filter: { _id: team._id }, update: { $set: { members: memberIds } } },
      })), { ordered: true });
    }
    if (legacyFieldCount) await participants.updateMany({ is_kiit_student: { $exists: true } }, { $unset: { is_kiit_student: "" } });
    if (separatorMigrations.length) await participants.bulkWrite(separatorMigrations.map((participant) => ({ updateOne: { filter: { _id: participant._id }, update: { $set: { qr_separator: participant.separator } } } })), { ordered: true });
    console.log(JSON.stringify({ migrated: true, backupPath }));
  }
} finally {
  await client.close();
}
