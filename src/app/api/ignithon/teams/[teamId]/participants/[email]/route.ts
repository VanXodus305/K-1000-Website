import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";

const COOLING_PERIOD_MS = 5 * 60 * 1000;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ teamId: string; email: string }> }) {
  const session = await getIgnithonSession();
  const { teamId: rawTeamId, email: rawEmail } = await params;
  const teamId = Number(rawTeamId);
  const email = normalizeEmail(decodeURIComponent(rawEmail));
  if (!session || session.teamId !== teamId || (session.role !== "leader" && session.email !== email)) return NextResponse.json({ error: "You are not allowed to edit these details." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const allowed = ["name", "phone", "branch", "year", "hostel"];
    const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    if (typeof updates.name === "string") updates.name = updates.name.trim();
    if (typeof updates.phone === "string") updates.phone = updates.phone.trim();
    if (typeof updates.branch === "string") updates.branch = updates.branch.trim();
    if (updates.hostel === "string") updates.hostel = updates.hostel.trim() || null;
    if (updates.year !== undefined && (!Number.isInteger(updates.year) || Number(updates.year) < 1 || Number(updates.year) > 4)) return NextResponse.json({ error: "Invalid academic year." }, { status: 400 });
    const { participants } = await getIgnithonCollections();
    const result = await participants.updateOne({ email, team_id: teamId, status: "ACTIVE" }, { $set: updates });
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
    const { teams, participants } = await getIgnithonCollections();
    const participant = await participants.findOne({ email, team_id: teamId, status: "ACTIVE" });
    if (!participant) return NextResponse.json({ error: "Active participant not found." }, { status: 404 });
    const team = await teams.findOne({ id: teamId });
    if (team?.members[0]?.equals(participant._id)) return NextResponse.json({ error: "The team leader cannot be removed from the team." }, { status: 409 });
    const removedAt = new Date();
    await participants.updateOne({ _id: participant._id }, { $set: { status: "REMOVED", removed_at: removedAt } });
    await teams.updateOne({ id: teamId }, { $pull: { members: participant._id } });
    return NextResponse.json({ ok: true, coolingPeriodSeconds: COOLING_PERIOD_MS / 1000 });
  } catch (error) {
    console.error("Ignithon participant removal failed", error);
    return NextResponse.json({ error: "Unable to remove participant right now." }, { status: 500 });
  }
}
