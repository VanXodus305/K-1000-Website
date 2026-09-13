import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, hasValidRegistrationIdentity, normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections, findTeamAndParticipants } from "@/lib/ignithon-db";
import { checkRateLimit } from "@/lib/ignithon-rate-limit";
import type { ParticipantInput } from "@/lib/ignithon-types";

const MAX_TEAM_SIZE = 4;
const COOLING_PERIOD_MS = 5 * 60 * 1000;

function validParticipant(value: Partial<ParticipantInput>) {
  return Boolean(value.name?.trim() && value.email && hasValidRegistrationIdentity(value.email, value.roll_no, value.is_kiit_student) && value.phone?.trim() && value.branch?.trim() && Number.isInteger(value.year) && Number(value.year) >= 1 && Number(value.year) <= 6);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId || session.role !== "leader") return NextResponse.json({ error: "Only the team leader can add participants." }, { status: 403 });
  if (!checkRateLimit(`add:${session.email}`, 20)) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  try {
    const input = await request.json() as Partial<ParticipantInput>;
    if (!validParticipant(input)) return NextResponse.json({ error: "Complete all participant details with a valid email and roll number." }, { status: 400 });
    const { teams, participants } = await getIgnithonCollections();
    const { team, members } = await findTeamAndParticipants(teams, participants, teamId);
    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
    if (members.length >= MAX_TEAM_SIZE) return NextResponse.json({ error: "A team can have a maximum of four members including the leader." }, { status: 409 });
    const email = normalizeEmail(input.email!);
    const existing = await participants.findOne({ $or: [{ email }, { roll_no: input.roll_no }] });
    if (existing?.status === "ACTIVE") return NextResponse.json({ error: "This participant is already registered in a team." }, { status: 409 });
    if (existing?.removed_at && Date.now() - existing.removed_at.getTime() < COOLING_PERIOD_MS) return NextResponse.json({ error: "This participant can join another team after the five-minute cooling period." }, { status: 409 });

    const participant = { name: input.name!.trim(), email, is_kiit_student: input.is_kiit_student!, roll_no: input.roll_no!, hostel: input.hostel?.trim() || null, phone: input.phone!.trim(), branch: input.branch!.trim(), year: input.year!, team_id: teamId, status: "ACTIVE" as const };
    if (existing) {
      await participants.updateOne({ _id: existing._id }, { $set: participant, $unset: { removed_at: "" } });
    } else {
      await participants.insertOne(participant);
    }
    await teams.updateOne({ id: teamId }, { $push: { members: { email, role: "member" } } });
    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error("Ignithon participant creation failed", error);
    return NextResponse.json({ error: "Unable to add this participant right now." }, { status: 500 });
  }
}
