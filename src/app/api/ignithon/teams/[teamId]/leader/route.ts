import { NextRequest, NextResponse } from "next/server";
import { getIgnithonSession, isValidEmail, normalizeEmail, setIgnithonSession } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { checkRateLimit } from "@/lib/ignithon-rate-limit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId || session.role !== "leader") return NextResponse.json({ error: "Only the current team leader can transfer leadership." }, { status: 403 });
  if (!checkRateLimit(`leader-transfer:${session.email}`, 10)) return NextResponse.json({ error: "Too many leadership transfer attempts. Please try again shortly." }, { status: 429 });

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

    const result = await teams.updateOne(
      { id: teamId, "members.0": currentLeader._id },
      { $set: { members: nextMembers, updatedAt: new Date() } },
    );
    if (!result.modifiedCount) return NextResponse.json({ error: "Leadership changed before this request completed. Refresh and try again." }, { status: 409 });

    await setIgnithonSession({ email: session.email, teamId, role: "member" });
    return NextResponse.json({ ok: true, previousLeader: session.email, leader: targetEmail });
  } catch (error) {
    console.error("Ignithon leadership transfer failed", error);
    return NextResponse.json({ error: "Unable to transfer leadership right now." }, { status: 500 });
  }
}
