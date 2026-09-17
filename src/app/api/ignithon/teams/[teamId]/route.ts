import { NextResponse } from "next/server";
import { getIgnithonSession, normalizeEmail, setIgnithonSession } from "@/lib/ignithon-auth";
import { findTeamAndParticipants, getIgnithonCollections, serializeParticipant } from "@/lib/ignithon-db";
import { checkStrictRateLimit, rateLimitResponse } from "@/lib/ignithon-rate-limit";

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { teams, participants } = await getIgnithonCollections();
    const { team, members } = await findTeamAndParticipants(teams, participants, teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    const currentParticipant = members.find((participant) => participant.email === session.email);
    if (!currentParticipant) return NextResponse.json({ error: "Your active team membership was not found." }, { status: 401 });
    const role = team.members[0]?.equals(currentParticipant._id) ? "leader" : "member";
    if (role !== session.role) await setIgnithonSession({ email: session.email, teamId, role });
    return NextResponse.json({
      team: { id: team.id, name: team.name, room: team.room ?? null, points: team.points, leader_email: members[0]?.email ?? "", member_count: members.length },
      participants: members.map(serializeParticipant),
      session: { ...session, role },
    });
  } catch (error) {
    console.error("Ignithon team lookup failed", error);
    return NextResponse.json({ error: "Unable to load team details." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkStrictRateLimit(`team-name:${session.email}:${teamId}`))) return rateLimitResponse("Too many team-name update attempts. Try again in 1 minute.") as NextResponse;

  try {
    const body = await request.json() as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2) return NextResponse.json({ error: "Team name must contain at least 2 characters." }, { status: 400 });

    const { teams, participants } = await getIgnithonCollections();
    const team = await teams.findOne({ id: teamId }, { projection: { _id: 1, members: 1 } });
    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
    const actingParticipant = await participants.findOne({ email: normalizeEmail(session.email), team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 } });
    if (!actingParticipant || !team.members[0]?.equals(actingParticipant._id)) {
      return NextResponse.json({ error: "Only the current team leader can change the team name." }, { status: 403 });
    }

    const result = await teams.updateOne({ id: teamId, "members.0": actingParticipant._id }, { $set: { name, updatedAt: new Date() } });
    if (!result.modifiedCount) return NextResponse.json({ error: "Team details changed before this request completed. Refresh and try again." }, { status: 409 });
    return NextResponse.json({ ok: true, name });
  } catch (error) {
    console.error("Ignithon team name update failed", error);
    return NextResponse.json({ error: "Unable to update the team name right now." }, { status: 500 });
  }
}
