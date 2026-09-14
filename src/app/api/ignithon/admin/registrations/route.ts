import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminKey } from "@/lib/ignithon-api-key";
import { getIgnithonCollections } from "@/lib/ignithon-db";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!hasValidAdminKey(request.headers.get("x-ignithon-admin-key"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { teams, participants } = await getIgnithonCollections();
    const [teamRecords, participantRecords] = await Promise.all([
      teams.find({}).sort({ id: 1 }).toArray(),
      participants.find({}).sort({ team_id: 1, status: 1, roll_no: 1 }).toArray(),
    ]);
    const teamsById = new Map(teamRecords.map((team) => [team.id, team]));
    const rows = participantRecords.map((participant) => {
      const team = teamsById.get(participant.team_id);
      const role = team?.members[0]?.equals(participant._id) ? "leader" : "member";
      return {
        team_id: participant.team_id,
        team_name: team?.name ?? "",
        role,
        status: participant.status,
        name: participant.name,
        email: participant.email,
        roll_no: participant.roll_no,
        phone: participant.phone,
        branch: participant.branch,
        year: participant.year,
        hostel: participant.hostel ?? "Day boarder",
        checked_in_at: participant.checked_in_at?.toISOString() ?? "",
        checked_in_by: participant.checked_in_by ?? "",
        removed_at: participant.removed_at?.toISOString() ?? "",
      };
    });

    const format = request.nextUrl.searchParams.get("format");
    if (format === "csv") {
      const headers = Object.keys(rows[0] ?? { team_id: "", team_name: "", role: "", status: "", name: "", email: "", roll_no: "", phone: "", branch: "", year: "", hostel: "", checked_in_at: "", checked_in_by: "", removed_at: "" });
      const csv = [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header as keyof typeof row])).join(","))].join("\n");
      return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ignithon-registrations-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" } });
    }

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: { teams: teamRecords.length, registrations: rows.length, active: rows.filter((row) => row.status === "ACTIVE").length, checkedIn: rows.filter((row) => row.checked_in_at).length },
      teams: teamRecords.map((team) => ({ id: team.id, name: team.name, memberCount: team.members.length })),
      registrations: rows,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Ignithon registration export failed", error);
    return NextResponse.json({ error: "Unable to load registration data." }, { status: 500 });
  }
}
