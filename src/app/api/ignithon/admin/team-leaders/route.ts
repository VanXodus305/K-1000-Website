import { NextRequest, NextResponse } from "next/server";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { hasValidAdminKey } from "@/lib/ignithon-api-key";

export async function GET(request: NextRequest) {
  const suppliedKey = request.headers.get("x-ignithon-admin-key");
  if (!hasValidAdminKey(suppliedKey)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { teams, participants } = await getIgnithonCollections();
    const teamRecords = await teams.find({}).toArray();
    const leaderEmails = teamRecords.map((team) => team.members.find((member) => member.role === "leader")?.email).filter((email): email is string => Boolean(email));
    const leaders = await participants.find({ email: { $in: leaderEmails }, status: "ACTIVE" }).toArray();
    const teamsById = new Map(teamRecords.map((team) => [team.id, team]));
    return NextResponse.json({ teams: leaders.filter((leader) => teamsById.has(leader.team_id)).map((leader) => ({ teamId: leader.team_id, teamName: teamsById.get(leader.team_id)?.name, leader: { name: leader.name, email: leader.email, roll_no: leader.roll_no, phone: leader.phone } })) });
  } catch (error) {
    console.error("Ignithon leader directory failed", error);
    return NextResponse.json({ error: "Unable to load the team leader directory." }, { status: 500 });
  }
}
