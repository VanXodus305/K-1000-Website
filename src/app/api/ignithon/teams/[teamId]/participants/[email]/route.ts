import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { getMongoClient } from "@/lib/mongodb";
import { checkStrictRateLimit, rateLimitResponse } from "@/lib/ignithon-rate-limit";

const COOLING_PERIOD_MS = 5 * 60 * 1000;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ teamId: string; email: string }> }) {
  const session = await getIgnithonSession();
  const { teamId: rawTeamId, email: rawEmail } = await params;
  const teamId = Number(rawTeamId);
  const email = normalizeEmail(decodeURIComponent(rawEmail));
  if (!session || session.teamId !== teamId) return NextResponse.json({ error: "You are not allowed to edit these details." }, { status: 403 });
  if (!(await checkStrictRateLimit(`participant-edit:${session.email}:${teamId}`))) return rateLimitResponse("Too many participant-edit attempts. Try again in 10 minutes.") as NextResponse;
  try {
    const body = await request.json() as Record<string, unknown>;
    const allowed = ["name", "phone", "branch", "year", "hostel"];
    const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    if (typeof updates.name === "string") updates.name = updates.name.trim();
    if (typeof updates.phone === "string") updates.phone = updates.phone.trim();
    if (typeof updates.branch === "string") updates.branch = updates.branch.trim();
    if (updates.hostel === "string") updates.hostel = updates.hostel.trim() || null;
    if (!Object.keys(updates).length) return NextResponse.json({ error: "Provide at least one detail to update." }, { status: 400 });
    if (typeof updates.name === "string" && (updates.name.length < 2 || updates.name.length > 80)) return NextResponse.json({ error: "Name must be between 2 and 80 characters." }, { status: 400 });
    if (typeof updates.phone === "string" && !/^\+?[0-9\s()-]{10,16}$/.test(updates.phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    if (typeof updates.branch === "string" && (updates.branch.length < 2 || updates.branch.length > 120)) return NextResponse.json({ error: "Select a valid branch." }, { status: 400 });
    if (typeof updates.hostel === "string" && updates.hostel.length > 80) return NextResponse.json({ error: "Hostel must be 80 characters or fewer." }, { status: 400 });
    if (updates.year !== undefined && (!Number.isInteger(updates.year) || Number(updates.year) < 1 || Number(updates.year) > 5)) return NextResponse.json({ error: "Invalid academic year." }, { status: 400 });
    const { teams, participants } = await getIgnithonCollections();
    const team = await teams.findOne({ id: teamId }, { projection: { _id: 1, members: 1 } });
    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
    const actingEmail = normalizeEmail(session.email);
    const actingParticipant = await participants.findOne({ email: actingEmail, team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 } });
    const isCurrentLeader = Boolean(actingParticipant && team.members[0]?.equals(actingParticipant._id));
    if (!isCurrentLeader && actingEmail !== email) return NextResponse.json({ error: "You are not allowed to edit these details." }, { status: 403 });
    const result = await participants.updateOne({ email, team_id: team._id, status: "ACTIVE" }, { $set: { ...updates, updatedAt: new Date() } });
    if (!result.matchedCount) return NextResponse.json({ error: "Active participant not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Ignithon participant update failed", error);
    return NextResponse.json({ error: "Unable to update participant details." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ teamId: string; email: string }> }) {
  const session = await getIgnithonSession();
  const { teamId: rawTeamId, email: rawEmail } = await params;
  const teamId = Number(rawTeamId);
  const email = normalizeEmail(decodeURIComponent(rawEmail));
  if (!session || session.teamId !== teamId || session.role !== "leader") return NextResponse.json({ error: "Only the team leader can remove participants." }, { status: 403 });
  try {
    const client = await getMongoClient();
    const { teams, participants } = await getIgnithonCollections();
    const transactionSession = client.startSession();
    try {
      await transactionSession.withTransaction(async () => {
        const team = await teams.findOne({ id: teamId }, { session: transactionSession });
        const actingParticipant = team ? await participants.findOne({ email: normalizeEmail(session.email), team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 }, session: transactionSession }) : null;
        if (!team || !actingParticipant || !team.members[0]?.equals(actingParticipant._id)) throw new Error("Only the current team leader can remove participants.");
        const participant = await participants.findOne({ email, team_id: team._id, status: "ACTIVE" }, { session: transactionSession });
        if (!participant) throw new Error("Active participant not found.");
        if (team.members[0]?.equals(participant._id)) throw new Error("The team leader cannot be removed from the team.");
        const removedAt = new Date();
        const participantUpdate = await participants.updateOne({ _id: participant._id, team_id: team._id, status: "ACTIVE" }, { $set: { status: "REMOVED", removed_at: removedAt, updatedAt: removedAt } }, { session: transactionSession });
        const rosterUpdate = await teams.updateOne({ _id: team._id, members: participant._id }, { $pull: { members: participant._id }, $set: { updatedAt: new Date() } }, { session: transactionSession });
        if (!participantUpdate.modifiedCount || !rosterUpdate.modifiedCount) throw new Error("The team roster changed before this request completed. Please refresh and try again.");
      }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
      return NextResponse.json({ ok: true, coolingPeriodSeconds: COOLING_PERIOD_MS / 1000 });
    } finally {
      await transactionSession.endSession();
    }
  } catch (error) {
    console.error("Ignithon participant removal failed", error);
    return NextResponse.json({ error: "Unable to remove participant right now." }, { status: 500 });
  }
}
