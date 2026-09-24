import { MongoServerError, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import type { EvaluationAlertHall, IgnithonEvaluationAlert } from "@/lib/ignithon-types";

export const runtime = "nodejs";

function parseObjectId(value: unknown) {
  if (typeof value !== "string" || !ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

function resolveAssignedHall(team: { room?: string | null; teamRoom?: string | null }): EvaluationAlertHall | null {
  const value = (team.room ?? team.teamRoom ?? "").trim().toUpperCase();
  return value === "A" || value === "B" || value === "C" ? value : null;
}

function serializeAlert(alert: (IgnithonEvaluationAlert & { _id?: ObjectId }) | null) {
  if (!alert) return null;
  return {
    id: alert._id?.toHexString() ?? null,
    teamId: alert.team_id.toHexString(),
    participantId: alert.raised_by_participant_id?.toHexString() ?? null,
    hall: alert.hall,
    status: alert.status,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
    resolvedAt: alert.resolved_at?.toISOString() ?? null,
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

  const hall = resolveAssignedHall(team);
  if (!hall) return { error: NextResponse.json({ error: "This team has not been assigned to a hall yet." }, { status: 409 }) } as const;

  const actingParticipant = await participants.findOne({ email: normalizeEmail(session.email), team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 } });
  if (!actingParticipant) return { error: NextResponse.json({ error: "Your active team membership was not found." }, { status: 401 }) } as const;

  if (participantId) {
    const participant = await participants.findOne({ _id: participantId, team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 } });
    if (!participant) return { error: NextResponse.json({ error: "The selected participant is not an active member of this team." }, { status: 404 }) } as const;
  }

  return { session, team, participantId, actingParticipant, hall } as const;
}

export async function GET(request: NextRequest) {
  try {
    const context = await resolveAlertContext(request.nextUrl.searchParams.get("teamId"), request.nextUrl.searchParams.get("participantId"));
    if ("error" in context) return context.error;
    const { evaluationAlerts } = await getIgnithonCollections();
    const query = {
      team_id: context.team._id,
      status: "active" as const,
      ...(context.participantId ? { raised_by_participant_id: context.participantId } : {}),
    };
    const alert = await evaluationAlerts.findOne(query);
    console.info(JSON.stringify({ event: "evaluation_alert_status_checked", teamId: context.team.id, hall: context.hall, active: Boolean(alert) }));
    return NextResponse.json({ active: Boolean(alert), hall: context.hall, alert: serializeAlert(alert) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Evaluation alert status check failed", error);
    return NextResponse.json({ error: "Unable to check evaluation alert status." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { teamId?: unknown; participantId?: unknown; action?: unknown };
    if (body.action !== "raise" && body.action !== "dismiss") {
      return NextResponse.json({ error: "action must be either raise or dismiss." }, { status: 400 });
    }

    const context = await resolveAlertContext(body.teamId, body.participantId);
    if ("error" in context) return context.error;
    const { evaluationAlerts } = await getIgnithonCollections();
    const now = new Date();
    const filter = {
      team_id: context.team._id,
      status: "active" as const,
      raised_by_participant_id: context.participantId,
    };

    if (body.action === "dismiss") {
      const result = await evaluationAlerts.updateOne(filter, { $set: { status: "dismissed", updatedAt: now } });
      console.info(JSON.stringify({ event: "evaluation_alert_dismissed", teamId: context.team.id, hall: context.hall, dismissed: result.modifiedCount > 0 }));
      return NextResponse.json({ active: false, dismissed: result.modifiedCount > 0, hall: context.hall });
    }

    let created = false;
    try {
      const result = await evaluationAlerts.insertOne({
        team_id: context.team._id,
        hall: context.hall,
        status: "active",
        raised_by_participant_id: context.participantId,
        resolved_by_oc_id: null,
        resolved_at: null,
        createdAt: now,
        updatedAt: now,
      });
      created = Boolean(result.insertedId);
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    }

    const alert = await evaluationAlerts.findOne(filter);
    console.info(JSON.stringify({ event: "evaluation_alert_called", teamId: context.team.id, hall: context.hall, created }));
    return NextResponse.json({ active: true, created, hall: context.hall, alert: serializeAlert(alert) });
  } catch (error) {
    console.error("Evaluation alert request failed", error);
    return NextResponse.json({ error: "Unable to update the evaluation alert." }, { status: 500 });
  }
}
