import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ignithon-rate-limit";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { findTeamAndParticipants, serializeParticipant } from "@/lib/ignithon-db";
import { setIgnithonSession } from "@/lib/ignithon-auth";

export async function POST(request: NextRequest) {
  if (!checkRateLimit(`access:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 20)) {
    return NextResponse.json({ error: "Too many access attempts. Please try again shortly." }, { status: 429 });
  }
  try {
    const body = await request.json() as { rollNo?: string | number; teamId?: number };
    const rollNo = typeof body.rollNo === "number" ? String(body.rollNo) : body.rollNo?.trim();
    if (!rollNo || !/^\d+$/.test(rollNo) || Number(rollNo) <= 0 || !Number.isInteger(body.teamId) || (body.teamId ?? 0) < 1000 || (body.teamId ?? 0) > 9999) {
      return NextResponse.json({ error: "Enter your registered roll number and four-digit Team ID." }, { status: 400 });
    }
    const teamId = Number(body.teamId);
    const { teams, participants } = await getIgnithonCollections();
    const team = await teams.findOne({ id: teamId });
    const participant = team ? await participants.findOne({ roll_no: rollNo, team_id: team._id, status: "ACTIVE" }) : null;
    if (!team || !participant) return NextResponse.json({ error: "No active team membership matches those details." }, { status: 401 });
    const role = team.members[0]?.equals(participant._id) ? "leader" : "member";
    await setIgnithonSession({ email: participant.email, teamId, role });
    const { members } = await findTeamAndParticipants(teams, participants, teamId);
    return NextResponse.json({
      teamId,
      role,
      portal: {
        team: { id: team.id, name: team.name, room: team.room ?? null, points: team.points, leader_email: members[0]?.email ?? "", member_count: members.length },
        participants: members.map(serializeParticipant),
        session: { email: participant.email, role },
      },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Ignithon access failed", error);
    return NextResponse.json({ error: "Unable to access the team portal right now." }, { status: 500 });
  }
}
