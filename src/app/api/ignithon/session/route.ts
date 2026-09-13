import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ignithon-rate-limit";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { setIgnithonSession } from "@/lib/ignithon-auth";

export async function POST(request: NextRequest) {
  if (!checkRateLimit(`access:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 20)) {
    return NextResponse.json({ error: "Too many access attempts. Please try again shortly." }, { status: 429 });
  }
  try {
    const body = await request.json() as { rollNo?: number; teamId?: number };
    if (!Number.isInteger(body.rollNo) || Number(body.rollNo) <= 0 || !Number.isInteger(body.teamId) || (body.teamId ?? 0) < 1000 || (body.teamId ?? 0) > 9999) {
      return NextResponse.json({ error: "Enter your registered roll number and four-digit Team ID." }, { status: 400 });
    }
    const teamId = Number(body.teamId);
    const { teams, participants } = await getIgnithonCollections();
    const team = await teams.findOne({ id: teamId });
    const participant = await participants.findOne({ roll_no: Number(body.rollNo), team_id: teamId, status: "ACTIVE" });
    if (!team || !participant) return NextResponse.json({ error: "No active team membership matches those details." }, { status: 401 });
    const role = team.members.find((member) => member.email === participant.email)?.role ?? "member";
    await setIgnithonSession({ email: participant.email, teamId, role });
    return NextResponse.json({ teamId, role });
  } catch (error) {
    console.error("Ignithon access failed", error);
    return NextResponse.json({ error: "Unable to access the team portal right now." }, { status: 500 });
  }
}
