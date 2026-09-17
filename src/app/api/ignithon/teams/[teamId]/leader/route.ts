import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, isValidEmail, normalizeEmail, setIgnithonSession } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { getMongoClient } from "@/lib/mongodb";
import { checkStrictRateLimit, rateLimitResponse } from "@/lib/ignithon-rate-limit";
import { triggerIgnithonSheetsSync } from "@/lib/ignithon-sheets";

class LeadershipUpdateError extends Error {
  constructor(public status: 409 | 500, message: string) {
    super(message);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId) return NextResponse.json({ error: "Only the current team leader can transfer leadership." }, { status: 403 });
  if (!(await checkStrictRateLimit(`leader-transfer:${session.email}:${teamId}`))) return rateLimitResponse("Too many leadership-transfer attempts. Try again in 1 minute.") as NextResponse;

  try {
    const body = await request.json() as { email?: unknown };
    const targetEmail = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!isValidEmail(targetEmail) || targetEmail === session.email) return NextResponse.json({ error: "Select another active team member." }, { status: 400 });

    const { teams, participants } = await getIgnithonCollections();
    const [team, target, currentLeader] = await Promise.all([
      teams.findOne({ id: teamId }),
      participants.findOne({ email: targetEmail, status: "ACTIVE" }),
      participants.findOne({ email: session.email, status: "ACTIVE" }),
    ]);
    if (!team || !target || !currentLeader) return NextResponse.json({ error: "The selected active team member was not found." }, { status: 404 });
    if (!target.team_id.equals(team._id) || !currentLeader.team_id.equals(team._id)) return NextResponse.json({ error: "The selected person is not an active member of this team." }, { status: 409 });
    const targetIsMember = team.members.some((memberId) => memberId.equals(target._id));
    if (!team.members[0]?.equals(currentLeader._id) || !targetIsMember) return NextResponse.json({ error: "Leadership has changed or the selected person is not eligible." }, { status: 409 });

    const nextMembers = [target._id, ...team.members.filter((memberId) => !memberId.equals(target._id))];

    const mongoClient = await getMongoClient();
    const transactionSession = mongoClient.startSession();
    try {
      await transactionSession.withTransaction(async () => {
        const result = await teams.updateOne(
          { id: teamId, "members.0": currentLeader._id, members: target._id },
          { $set: { members: nextMembers, updatedAt: new Date() } },
          { session: transactionSession },
        );
        if (!result.modifiedCount) throw new LeadershipUpdateError(409, "Leadership changed before this request completed. Refresh and try again.");
        const updatedTeam = await teams.findOne({ id: teamId }, { projection: { members: 1 }, session: transactionSession });
        if (!updatedTeam?.members[0]?.equals(target._id)) throw new LeadershipUpdateError(500, "Leadership was not synchronized to the team roster. Try again.");
      });
    } finally {
      await transactionSession.endSession();
    }

    await setIgnithonSession({ email: session.email, teamId, role: "member" });
    triggerIgnithonSheetsSync(teamId, "leadership_transferred");
    return NextResponse.json({ ok: true, previousLeader: session.email, leader: targetEmail });
  } catch (error) {
    if (error instanceof LeadershipUpdateError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Ignithon leadership transfer failed", error);
    return NextResponse.json({ error: "Unable to transfer leadership right now." }, { status: 500 });
  }
}
