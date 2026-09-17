import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { getMongoClient } from "@/lib/mongodb";
import { MongoServerError, type ObjectId } from "mongodb";
import type { ParticipantInput } from "@/lib/ignithon-types";
import { validateParticipantFields } from "@/lib/ignithon-validation";
import { triggerIgnithonSheetsSync } from "@/lib/ignithon-sheets";

const MAX_TEAM_SIZE = 4;
const COOLING_PERIOD_MS = 5 * 60 * 1000;

class RegistrationError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId) return NextResponse.json({ error: "Only the team leader can add participants." }, { status: 403 });
  try {
    const input = await request.json() as Partial<ParticipantInput>;
    const participantError = validateParticipantFields(input);
    if (participantError) return NextResponse.json({ error: `Participant ${participantError.charAt(0).toLowerCase()}${participantError.slice(1)}` }, { status: 400 });
    const email = normalizeEmail(input.email!);
    const { teams, participants } = await getIgnithonCollections();
    const client = await getMongoClient();
    const transactionSession = client.startSession();
    try {
      let participant: (ParticipantInput & { team_id: ObjectId; status: "ACTIVE" }) | null = null;
      await transactionSession.withTransaction(async () => {
        const team = await teams.findOne({ id: teamId }, { session: transactionSession });
        if (!team) throw new RegistrationError(404, "Team not found.");
        const actingParticipant = await participants.findOne({ email: normalizeEmail(session.email), team_id: team._id, status: "ACTIVE" }, { projection: { _id: 1 }, session: transactionSession });
        if (!actingParticipant || !team.members[0]?.equals(actingParticipant._id)) throw new RegistrationError(403, "Only the team leader can add participants.");
        const memberCount = await participants.countDocuments({ team_id: team._id, status: "ACTIVE" }, { session: transactionSession });
        if (memberCount >= MAX_TEAM_SIZE) throw new RegistrationError(409, "A team can have a maximum of four members including the leader.");
        const [existingByEmail, existingByRoll] = await Promise.all([
          participants.findOne({ email }, { session: transactionSession }),
          participants.findOne({ roll_no: input.roll_no }, { session: transactionSession }),
        ]);
        if (existingByEmail && existingByRoll && !existingByEmail._id.equals(existingByRoll._id)) throw new RegistrationError(409, "The email or roll number belongs to another participant.");
        if ((existingByEmail && !existingByRoll) || (!existingByEmail && existingByRoll)) throw new RegistrationError(409, "The email or roll number is already registered with different identity details.");
        const existing = existingByEmail ?? existingByRoll;
        if (existing?.status === "ACTIVE") throw new RegistrationError(409, "This participant is already registered in a team.");
        if (existing?.removed_at && Date.now() - existing.removed_at.getTime() < COOLING_PERIOD_MS) throw new RegistrationError(409, "This participant can join another team after the five-minute cooling period.");
        participant = { name: input.name!.trim(), email, roll_no: input.roll_no!.trim(), hostel: input.hostel?.trim() || null, phone: input.phone!.trim(), branch: input.branch!.trim(), year: input.year!, team_id: team._id, status: "ACTIVE", attendance: existing?.attendance ?? false, updatedAt: new Date() };
        const participantId = existing
          ? (await participants.updateOne({ _id: existing._id, status: "REMOVED" }, { $set: participant, $unset: { removed_at: "" } }, { session: transactionSession })).matchedCount ? existing._id : null
          : (await participants.insertOne(participant, { session: transactionSession })).insertedId;
        if (!participantId) throw new RegistrationError(409, "This participant was changed by another registration. Please refresh and try again.");
        const rosterUpdate = await teams.updateOne({ _id: team._id, members: { $ne: participantId } }, { $push: { members: participantId }, $set: { updatedAt: new Date() } }, { session: transactionSession });
        if (!rosterUpdate.modifiedCount) throw new RegistrationError(409, "The team roster changed before this request completed. Please refresh and try again.");
      }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
      if (!participant) throw new Error("Participant registration did not complete.");
      triggerIgnithonSheetsSync(teamId, "participant_added");
      return NextResponse.json({ participant }, { status: 201 });
    } catch (error) {
      if (error instanceof RegistrationError) return NextResponse.json({ error: error.message }, { status: error.status });
      if (error instanceof MongoServerError && error.code === 11000) return NextResponse.json({ error: "Email address or roll number is already registered to another participant." }, { status: 409 });
      throw error;
    } finally {
      await transactionSession.endSession();
    }
  } catch (error) {
    console.error("Ignithon participant creation failed", error);
    return NextResponse.json({ error: "Unable to add this participant right now." }, { status: 500 });
  }
}
