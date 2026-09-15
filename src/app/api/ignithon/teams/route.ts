import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { checkStrictRateLimit, getClientDeviceId, rateLimitResponse } from "@/lib/ignithon-rate-limit";
import { allocateIgnithonQrSeparator, getIgnithonCollections } from "@/lib/ignithon-db";
import { hasValidRegistrationIdentity, normalizeEmail, setIgnithonSession } from "@/lib/ignithon-auth";
import type { ParticipantInput } from "@/lib/ignithon-types";
import { syncIgnithonSheetsAfterTeamCreation } from "@/lib/ignithon-sheets";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function validParticipant(value: Partial<ParticipantInput>) {
  return Boolean(
    value.name?.trim() &&
    value.email && hasValidRegistrationIdentity(value.email, value.roll_no) &&
    value.phone?.trim() && value.branch?.trim() &&
    Number.isInteger(value.year) && Number(value.year) >= 1 && Number(value.year) <= 5,
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
  const deviceId = getClientDeviceId(request);
  if (deviceId && !checkStrictRateLimit(`create:${deviceId}`)) return rateLimitResponse("Too many registration attempts from this browser. Try again in 10 minutes.") as NextResponse;

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
      return badRequest("This email address or roll number is already registered. Use Existing Team Login with your Team ID.", 409);
    }

    const qrSeparator = await allocateIgnithonQrSeparator(participants);
    const participant: ParticipantInput = {
      name: leader.name!.trim(), email: leaderEmail, roll_no: leader.roll_no!.trim(),
      qr_separator: qrSeparator,
      hostel: leader.hostel?.trim() || null, phone: leader.phone!.trim(),
      branch: leader.branch!.trim(), year: leader.year!, attendance: false, is_kiit_student: false, updatedAt: new Date(),
    };
    let teamId: number | null = null;
    let teamResult: Awaited<ReturnType<typeof teams.insertOne>> | null = null;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const candidateId = await generateTeamId(teams);
      try {
        const now = new Date();
        teamResult = await teams.insertOne({ id: candidateId, name: body.name.trim(), members: [], points: 0, room: null, createdAt: now, updatedAt: now });
        teamId = candidateId;
        break;
      } catch (error) {
        if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      }
    }
    if (!teamResult || teamId === null) throw new Error("Unable to allocate a unique team ID");
    try {
      const participantResult = await participants.insertOne({ ...participant, team_id: teamResult.insertedId, status: "ACTIVE" });
      await teams.updateOne({ _id: teamResult.insertedId }, { $set: { members: [participantResult.insertedId], updatedAt: new Date() } });
    } catch (error) {
      await Promise.all([teams.deleteOne({ _id: teamResult.insertedId }), participants.deleteOne({ team_id: teamResult.insertedId, email: leaderEmail })]);
      throw error;
    }

    await setIgnithonSession({ email: leaderEmail, teamId, role: "leader" });
    after(() => syncIgnithonSheetsAfterTeamCreation());
    return NextResponse.json({ teamId }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return badRequest("This email address or roll number is already registered.", 409);
    console.error("Ignithon team creation failed", error);
    return NextResponse.json({ error: "Unable to create the team right now." }, { status: 500 });
  }
}
