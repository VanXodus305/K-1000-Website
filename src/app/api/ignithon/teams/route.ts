import { NextRequest, NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { checkRateLimit } from "@/lib/ignithon-rate-limit";
import { allocateIgnithonQrSeparator, getIgnithonCollections } from "@/lib/ignithon-db";
import { hasValidRegistrationIdentity, normalizeEmail, setIgnithonSession } from "@/lib/ignithon-auth";
import type { ParticipantInput } from "@/lib/ignithon-types";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function validParticipant(value: Partial<ParticipantInput>) {
  return Boolean(
    value.name?.trim() &&
    value.email && hasValidRegistrationIdentity(value.email, value.roll_no) &&
    value.phone?.trim() && value.branch?.trim() &&
    Number.isInteger(value.year) && Number(value.year) >= 1 && Number(value.year) <= 4,
  );
}

async function generateTeamId(teams: Awaited<ReturnType<typeof getIgnithonCollections>>["teams"]) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const id = 1000 + Math.floor(Math.random() * 9000);
    if (!(await teams.findOne({ id }, { projection: { _id: 1 } }))) return id;
  }
  throw new Error("Unable to allocate a team ID");
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(`create:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10)) {
    return badRequest("Too many registration attempts. Please try again shortly.", 429);
  }

  try {
    const body = await request.json() as { name?: string; leader?: Partial<ParticipantInput> };
    const leader = body.leader ?? {};
    const leaderEmail = normalizeEmail(leader.email ?? "");
    if (!body.name?.trim() || !validParticipant(leader)) return badRequest("Complete all team leader details with a valid email and roll number.");

    const { teams, participants } = await getIgnithonCollections();
    const [participantByEmail, participantByRoll] = await Promise.all([
      participants.findOne({ email: leaderEmail }),
      participants.findOne({ roll_no: leader.roll_no }),
    ]);
    if (participantByEmail || participantByRoll) {
      if (!participantByEmail || !participantByRoll || !participantByEmail._id.equals(participantByRoll._id)) {
        return badRequest("The submitted email or roll number is already registered to another participant.", 409);
      }
      const existingParticipant = participantByEmail;
      if (existingParticipant.status === "ACTIVE") {
        const existingTeam = await teams.findOne({ id: existingParticipant.team_id });
        const isExistingLeader = existingTeam?.members[0]?.equals(existingParticipant._id);
        if (existingTeam && isExistingLeader) {
          await setIgnithonSession({ email: leaderEmail, teamId: existingTeam.id, role: "leader" });
          return NextResponse.json({ teamId: existingTeam.id, existing: true });
        }
        return badRequest("You are already registered as a team member and cannot create a new team as leader.", 409);
      }
      return badRequest("A previously registered team member cannot create a new team as leader.", 409);
    }

    const qrSeparator = await allocateIgnithonQrSeparator(participants);
    const participant: ParticipantInput = {
      name: leader.name!.trim(), email: leaderEmail, roll_no: leader.roll_no!,
      qr_separator: qrSeparator,
      hostel: leader.hostel?.trim() || null, phone: leader.phone!.trim(),
      branch: leader.branch!.trim(), year: leader.year!,
    };
    let teamId: number | null = null;
    let teamResult: Awaited<ReturnType<typeof teams.insertOne>> | null = null;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const candidateId = await generateTeamId(teams);
      try {
        teamResult = await teams.insertOne({ id: candidateId, name: body.name.trim(), members: [], points: 0 });
        teamId = candidateId;
        break;
      } catch (error) {
        if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      }
    }
    if (!teamResult || teamId === null) throw new Error("Unable to allocate a unique team ID");
    try {
      const participantResult = await participants.insertOne({ ...participant, team_id: teamId, status: "ACTIVE" });
      await teams.updateOne({ _id: teamResult.insertedId }, { $set: { members: [participantResult.insertedId] } });
    } catch (error) {
      await Promise.all([teams.deleteOne({ _id: teamResult.insertedId }), participants.deleteOne({ team_id: teamId, email: leaderEmail })]);
      throw error;
    }

    await setIgnithonSession({ email: leaderEmail, teamId, role: "leader" });
    return NextResponse.json({ teamId }, { status: 201 });
  } catch (error) {
    console.error("Ignithon team creation failed", error);
    return NextResponse.json({ error: "Unable to create the team right now." }, { status: 500 });
  }
}
