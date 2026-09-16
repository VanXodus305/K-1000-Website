import { writeFile } from "node:fs/promises";
import { MongoClient, ObjectId } from "mongodb";

const apply = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "k1000";
if (!uri) throw new Error("MONGODB_URI is not configured");

const client = new MongoClient(uri);
await client.connect();

try {
  const db = client.db(dbName);
  const teams = db.collection("ignithon-teams");
  const participants = db.collection("ignithon-participants");
  const teamRecords = await teams.find({}).toArray();
  const participantTeamMigrations = [];
  for (const team of teamRecords) {
    const legacyParticipants = await participants.find({ team_id: team.id }, { projection: { _id: 1 } }).toArray();
    participantTeamMigrations.push(...legacyParticipants.map((participant) => ({ _id: participant._id, teamId: team._id })));
  }

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

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", teams: teamRecords.length, teamsToMigrate: migrations.length, participantTeamReferencesToMigrate: participantTeamMigrations.length }));
  if (!apply) process.exitCode = migrations.length || participantTeamMigrations.length ? 2 : 0;
  if (apply && (migrations.length || participantTeamMigrations.length)) {
    const backupPath = `/tmp/ignithon-schema-backup-${Date.now()}.json`;
    await writeFile(backupPath, JSON.stringify({
      teams: migrations.map(({ team }) => ({ _id: team._id.toHexString(), id: team.id, members: team.members })),
      participantsWithLegacyTeamId: participantTeamMigrations.map((participant) => ({ _id: participant._id.toHexString(), teamId: participant.teamId.toHexString() })),
    }, null, 2), { mode: 0o600 });

    if (migrations.length) {
      await teams.bulkWrite(migrations.map(({ team, memberIds }) => ({
        updateOne: { filter: { _id: team._id }, update: { $set: { members: memberIds, updatedAt: new Date() } } },
      })), { ordered: true });
    }
    if (participantTeamMigrations.length) {
      await participants.bulkWrite(participantTeamMigrations.map((participant) => ({
        updateOne: { filter: { _id: participant._id, team_id: { $type: "number" } }, update: { $set: { team_id: participant.teamId } } },
      })), { ordered: true });
    }
    console.log(JSON.stringify({ migrated: true, backupPath }));
  }
} finally {
  await client.close();
}
