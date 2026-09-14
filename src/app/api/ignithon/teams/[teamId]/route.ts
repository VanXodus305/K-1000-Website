import { NextResponse } from "next/server";
import { getIgnithonSession, setIgnithonSession } from "@/lib/ignithon-auth";
import { findTeamAndParticipants, getIgnithonCollections, serializeParticipant } from "@/lib/ignithon-db";

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
