import type { Collection, WithId } from "mongodb";
import { getMongoDb } from "./mongodb";
import type { IgnithonEvaluationAlert, IgnithonParticipant, IgnithonTeam } from "./ignithon-types";

declare global {
  var __k1000IgnithonIndexesPromise: Promise<void> | undefined;
}

export async function getIgnithonCollections() {
  const db = await getMongoDb();
  const teams = db.collection<IgnithonTeam>("ignithon-teams");
  const participants = db.collection<IgnithonParticipant>("ignithon-participants");
  const evaluationAlerts = db.collection<IgnithonEvaluationAlert>("ignithon-evaluation-alerts");
  global.__k1000IgnithonIndexesPromise ??= Promise.all([
    teams.createIndex({ id: 1 }, { unique: true, name: "unique_team_id" }),
    participants.createIndex({ roll_no: 1 }, { unique: true, name: "unique_participant_roll_no" }),
    participants.createIndex({ email: 1 }, { unique: true, name: "unique_participant_email" }),
    participants.createIndex({ team_id: 1, status: 1 }, { name: "team_members" }),
    evaluationAlerts.createIndex(
      { team_id: 1, scope: 1 },
      { unique: true, name: "unique_active_evaluation_alert", partialFilterExpression: { status: "ACTIVE" } },
    ),
  ]).then(() => undefined);
  await global.__k1000IgnithonIndexesPromise;
  return { teams, participants, evaluationAlerts };
}

export function serializeParticipant(participant: WithId<IgnithonParticipant>) {
  const publicParticipant = { ...participant } as WithId<IgnithonParticipant> & { qr_separator?: unknown; is_kiit_student?: unknown };
  delete publicParticipant.qr_separator;
  delete publicParticipant.is_kiit_student;
  const { _id, team_id, ...serializedParticipant } = publicParticipant;
  return {
    ...serializedParticipant,
    id: _id.toHexString(),
    team_id: team_id.toHexString(),
    updatedAt: participant.updatedAt?.toISOString() ?? null,
    removed_at: participant.removed_at?.toISOString() ?? null,
  };
}

export async function findTeamAndParticipants(teams: Collection<IgnithonTeam>, participants: Collection<IgnithonParticipant>, teamId: number) {
  const team = await teams.findOne({ id: teamId });
  if (!team) return { team: null, members: [] };
  const activeParticipants = await participants.find({ _id: { $in: team.members }, team_id: team._id, status: "ACTIVE" }).toArray();
  const byId = new Map(activeParticipants.map((participant) => [participant._id.toHexString(), participant]));
  const members = team.members.map((memberId) => byId.get(memberId.toHexString())).filter((member): member is NonNullable<typeof member> => Boolean(member));
  return { team, members };
}
