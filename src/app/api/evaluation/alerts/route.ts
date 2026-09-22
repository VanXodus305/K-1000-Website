import { MongoServerError, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import type { EvaluationAlertScope, IgnithonEvaluationAlert } from "@/lib/ignithon-types";

export const runtime = "nodejs";

function parseObjectId(value: unknown) {
  if (typeof value !== "string" || !ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

function serializeAlert(alert: (IgnithonEvaluationAlert & { _id?: ObjectId }) | null) {
  if (!alert) return null;
  return {
    id: alert._id?.toHexString() ?? null,
    teamId: alert.team_id.toHexString(),
    participantId: alert.participant_id?.toHexString() ?? null,
    scope: alert.scope,
    status: alert.status,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
    dismissedAt: alert.dismissedAt?.toISOString() ?? null,
  };
}

async function resolveAlertContext(teamIdValue: unknown, participantIdValue: unknown) {
  const session = await getIgnithonSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;

  const teamId = parseObjectId(teamIdValue);
  if (!teamId) return { error: NextResponse.json({ error: "teamId must be a valid MongoDB team ID." }, { status: 400 }) } as const;

  const participantId = participantIdValue === undefined || participantIdValue === null || participantIdValue === ""
    ? null
    : parseObjectId(participantIdValue);
  if (participantIdValue !== undefined && participantIdValue !== null && participantIdValue !== "" && !participantId) {
    return { error: NextResponse.json({ error: "participantId must be a valid MongoDB participant ID." }, { status: 400 }) } as const;
  }

  const { teams, participants } = await getIgnithonCollections();
  const team = await teams.findOne({ _id: teamId });
  if (!team || team.id !== session.teamId) return { error: NextResponse.json({ error: "This team is not available to the current session." }, { status: 403 }) } as const;

  const actingParticipant = await participants.findOne({ email: normalizeEmail(session.email), team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 } });
  if (!actingParticipant) return { error: NextResponse.json({ error: "Your active team membership was not found." }, { status: 401 }) } as const;

  if (participantId) {
    const participant = await participants.findOne({ _id: participantId, team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 } });
    if (!participant) return { error: NextResponse.json({ error: "The selected participant is not an active member of this team." }, { status: 404 }) } as const;
  }

  const scope: EvaluationAlertScope = participantId ? "participant" : "team";
  return { session, team, participantId, actingParticipant, scope, participants, teams } as const;
}

export async function GET(request: NextRequest) {
  try {
    const context = await resolveAlertContext(request.nextUrl.searchParams.get("teamId"), request.nextUrl.searchParams.get("participantId"));
    if ("error" in context) return context.error;
    const { evaluationAlerts } = await getIgnithonCollections();
    const alert = await evaluationAlerts.findOne({ team_id: context.team._id, scope: context.scope, status: "ACTIVE" });
    console.info(JSON.stringify({ event: "evaluation_alert_status_checked", teamId: context.team.id, scope: context.scope, active: Boolean(alert) }));
    return NextResponse.json({ active: Boolean(alert), scope: context.scope, alert: serializeAlert(alert) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Evaluation alert status check failed", error);
    return NextResponse.json({ error: "Unable to check evaluation alert status." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { teamId?: unknown; participantId?: unknown; action?: unknown };
    const context = await resolveAlertContext(body.teamId, body.participantId);
    if ("error" in context) return context.error;
    const { evaluationAlerts } = await getIgnithonCollections();
    const now = new Date();
    const filter = { team_id: context.team._id, scope: context.scope, status: "ACTIVE" as const };

    if (body.action === "dismiss") {
      const result = await evaluationAlerts.updateOne(filter, { $set: { status: "DISMISSED", updatedAt: now, dismissedAt: now, dismissedBy: context.actingParticipant._id } });
      console.info(JSON.stringify({ event: "evaluation_alert_dismissed", teamId: context.team.id, scope: context.scope, dismissed: result.modifiedCount > 0 }));
      return NextResponse.json({ active: false, dismissed: result.modifiedCount > 0, scope: context.scope });
    }

    let created = false;
    try {
      const result = await evaluationAlerts.updateOne(
        filter,
        { $setOnInsert: { team_id: context.team._id, participant_id: context.participantId, scope: context.scope, status: "ACTIVE", createdAt: now }, $set: { updatedAt: now } },
        { upsert: true },
      );
      created = result.upsertedCount > 0;
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    }
    const alert = await evaluationAlerts.findOne(filter);
    console.info(JSON.stringify({ event: "evaluation_alert_called", teamId: context.team.id, scope: context.scope, created }));
    return NextResponse.json({ active: true, created, scope: context.scope, alert: serializeAlert(alert) });
  } catch (error) {
    console.error("Evaluation alert request failed", error);
    return NextResponse.json({ error: "Unable to update the evaluation alert." }, { status: 500 });
  }
}
