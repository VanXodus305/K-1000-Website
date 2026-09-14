import { NextRequest, NextResponse } from "next/server";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { hasValidAdminKey } from "@/lib/ignithon-api-key";

export async function GET(request: NextRequest) {
  const suppliedKey = request.headers.get("x-ignithon-admin-key");
  if (!hasValidAdminKey(suppliedKey)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { teams, participants } = await getIgnithonCollections();
    const teamRecords = await teams.find({}).toArray();
    const leaderIds = teamRecords.map((team) => team.members[0]).filter((id): id is NonNullable<typeof id> => Boolean(id));
    const leaders = await participants.find({ _id: { $in: leaderIds }, status: "ACTIVE" }).toArray();
    const teamsByObjectId = new Map(teamRecords.map((team) => [team._id.toHexString(), team]));
    return NextResponse.json({ teams: leaders.map((leader) => ({ teamId: teamsByObjectId.get(leader.team_id.toHexString())?.id, teamName: teamsByObjectId.get(leader.team_id.toHexString())?.name, leader: { name: leader.name, email: leader.email, roll_no: leader.roll_no, phone: leader.phone } })).filter((team) => team.teamId !== undefined) });
  } catch (error) {
    console.error("Ignithon leader directory failed", error);
    return NextResponse.json({ error: "Unable to load the team leader directory." }, { status: 500 });
  }
}
