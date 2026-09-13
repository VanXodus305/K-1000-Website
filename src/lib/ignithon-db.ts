import type { Collection } from "mongodb";
import { getMongoDb } from "./mongodb";
import type { IgnithonParticipant, IgnithonTeam } from "./ignithon-types";

export async function getIgnithonCollections() {
  const db = await getMongoDb();
  const teams = db.collection<IgnithonTeam>("ignithon-teams");
  const participants = db.collection<IgnithonParticipant>("ignithon-participants");
  await Promise.all([
    teams.createIndex({ id: 1 }, { unique: true, name: "unique_team_id" }),
    participants.createIndex({ roll_no: 1 }, { unique: true, name: "unique_participant_roll_no" }),
    participants.createIndex({ email: 1 }, { unique: true, name: "unique_participant_email" }),
    participants.createIndex({ team_id: 1, status: 1 }, { name: "team_members" }),
  ]);
  return { teams, participants };
}

export function serializeParticipant(participant: IgnithonParticipant) {
  return {
    ...participant,
    removed_at: participant.removed_at?.toISOString() ?? null,
    checked_in_at: participant.checked_in_at?.toISOString() ?? null,
  };
}

export function serializeTeam(team: IgnithonTeam) {
  return team;
}

export async function findTeamAndParticipants(teams: Collection<IgnithonTeam>, participants: Collection<IgnithonParticipant>, teamId: number) {
  const [team, members] = await Promise.all([
    teams.findOne({ id: teamId }),
    participants.find({ team_id: teamId, status: "ACTIVE" }).sort({ roll_no: 1 }).toArray(),
  ]);
  return { team, members };
}
