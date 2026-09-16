import { NextRequest, NextResponse } from "next/server";
import { getClientDeviceId, isStrictRateLimited, rateLimitResponse, recordStrictRateLimitFailure } from "@/lib/ignithon-rate-limit";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { findTeamAndParticipants, serializeParticipant } from "@/lib/ignithon-db";
import { setIgnithonSession } from "@/lib/ignithon-auth";

export async function POST(request: NextRequest) {
  const deviceId = getClientDeviceId(request);
  const rateKey = deviceId ? `access:${deviceId}` : null;
  if (rateKey && await isStrictRateLimited(rateKey)) return rateLimitResponse("Too many unsuccessful access attempts from this browser. Try again in 1 minute.") as NextResponse;
  try {
    const body = await request.json() as { rollNo?: string | number; teamId?: number };
    const rollNo = typeof body.rollNo === "number" ? String(body.rollNo) : body.rollNo?.trim();
    if (!rollNo || !/^\d+$/.test(rollNo) || Number(rollNo) <= 0 || !Number.isInteger(body.teamId) || (body.teamId ?? 0) < 1000 || (body.teamId ?? 0) > 9999) {
      if (rateKey) await recordStrictRateLimitFailure(rateKey);
      return NextResponse.json({ error: "Roll number must be numeric and Team ID must contain exactly 4 digits." }, { status: 400 });
    }
    const teamId = Number(body.teamId);
    const { teams, participants } = await getIgnithonCollections();
    const team = await teams.findOne({ id: teamId });
    const participant = team ? await participants.findOne({ roll_no: rollNo, team_id: team._id, status: "ACTIVE" }) : null;
    if (!team || !participant) {
      if (rateKey) await recordStrictRateLimitFailure(rateKey);
      return NextResponse.json({ error: "No active team membership matches that roll number and Team ID." }, { status: 401 });
    }
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
    if (rateKey) await recordStrictRateLimitFailure(rateKey);
    console.error("Ignithon access failed", error);
    return NextResponse.json({ error: "Unable to access the team portal right now." }, { status: 500 });
  }
}
