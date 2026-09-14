import type { Collection, WithId } from "mongodb";
import { getMongoDb } from "./mongodb";
import type { IgnithonParticipant, IgnithonTeam } from "./ignithon-types";
import { createIgnithonQrSeparator } from "./ignithon-qr";

export async function getIgnithonCollections() {
  const db = await getMongoDb();
  const teams = db.collection<IgnithonTeam>("ignithon-teams");
  const participants = db.collection<IgnithonParticipant>("ignithon-participants");
  await Promise.all([
    teams.createIndex({ id: 1 }, { unique: true, name: "unique_team_id" }),
    participants.createIndex({ roll_no: 1 }, { unique: true, name: "unique_participant_roll_no" }),
    participants.createIndex({ email: 1 }, { unique: true, name: "unique_participant_email" }),
    participants.createIndex({ qr_separator: 1 }, { unique: true, sparse: true, name: "unique_participant_qr_separator" }),
    participants.createIndex({ team_id: 1, status: 1 }, { name: "team_members" }),
  ]);
  return { teams, participants };
}

export function serializeParticipant(participant: WithId<IgnithonParticipant>) {
  const { _id: _internalId, ...publicParticipant } = participant;
  void _internalId;
  return {
    ...publicParticipant,
    removed_at: participant.removed_at?.toISOString() ?? null,
    checked_in_at: participant.checked_in_at?.toISOString() ?? null,
  };
}

export async function findTeamAndParticipants(teams: Collection<IgnithonTeam>, participants: Collection<IgnithonParticipant>, teamId: number) {
  const team = await teams.findOne({ id: teamId });
  if (!team) return { team: null, members: [] };
  const activeParticipants = await participants.find({ _id: { $in: team.members }, team_id: teamId, status: "ACTIVE" }).toArray();
  const byId = new Map(activeParticipants.map((participant) => [participant._id.toHexString(), participant]));
  const members = team.members.map((memberId) => byId.get(memberId.toHexString())).filter((member): member is NonNullable<typeof member> => Boolean(member));
  return { team, members };
}

export async function allocateIgnithonQrSeparator(participants: Collection<IgnithonParticipant>) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const separator = createIgnithonQrSeparator();
    if (!(await participants.findOne({ qr_separator: separator }, { projection: { _id: 1 } }))) return separator;
  }
  throw new Error("Unable to allocate a participant QR separator");
}
