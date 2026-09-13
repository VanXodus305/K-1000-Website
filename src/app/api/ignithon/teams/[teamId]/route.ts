import { NextResponse } from "next/server";
import { getIgnithonSession } from "@/lib/ignithon-auth";
import { findTeamAndParticipants, getIgnithonCollections, serializeParticipant } from "@/lib/ignithon-db";

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { teams, participants } = await getIgnithonCollections();
    const { team, members } = await findTeamAndParticipants(teams, participants, teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json({ team, participants: members.map(serializeParticipant), session });
  } catch (error) {
    console.error("Ignithon team lookup failed", error);
    return NextResponse.json({ error: "Unable to load team details." }, { status: 500 });
  }
}
