import { NextRequest, NextResponse } from "next/server";
import { hasValidApiKey } from "@/lib/ignithon-api-key";
import { normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { extractIgnithonQrToken, readIgnithonQrToken } from "@/lib/ignithon-qr";
import { checkRateLimit } from "@/lib/ignithon-rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const scannerKey = request.headers.get("x-ignithon-scanner-key");
  if (!hasValidApiKey(scannerKey, process.env.IGNITHON_SCANNER_KEY)) return NextResponse.json({ error: "Unauthorized scanner." }, { status: 401 });
  if (!checkRateLimit(`scan:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 120)) return NextResponse.json({ error: "Too many scan requests." }, { status: 429 });

  try {
    const body = await request.json() as { token?: unknown; scannerId?: unknown };
    if (typeof body.token !== "string") return NextResponse.json({ error: "QR token is required." }, { status: 400 });
    const payload = readIgnithonQrToken(extractIgnithonQrToken(body.token));
    if (!payload) return NextResponse.json({ error: "Invalid or damaged Ignithon QR code." }, { status: 400 });

    const scannerId = typeof body.scannerId === "string" ? body.scannerId.trim().slice(0, 80) : "scanner";
    const { teams, participants } = await getIgnithonCollections();

    if (payload.kind === "team") {
      const team = await teams.findOne({ id: payload.teamId, name: payload.teamName });
      if (!team) return NextResponse.json({ error: "This team registration is no longer valid." }, { status: 404 });
      const existingCheckIn = team.checked_in_at;
      const checkedInAt = existingCheckIn ?? new Date();
      if (!existingCheckIn) {
        await teams.updateOne(
          { _id: team._id, checked_in_at: { $exists: false } },
          { $set: { checked_in_at: checkedInAt, checked_in_by: scannerId } },
        );
      }
      const teamParticipants = await participants.find({ team_id: team.id, status: "ACTIVE" }).sort({ roll_no: 1 }).toArray();
      return NextResponse.json({
        ok: true,
        scanType: "team",
        alreadyCheckedIn: Boolean(existingCheckIn),
        checkedInAt: checkedInAt.toISOString(),
        team: { id: team.id, name: team.name, memberCount: teamParticipants.length },
        participants: teamParticipants.map((participant) => ({ name: participant.name, email: participant.email, rollNo: participant.roll_no, role: team.members.find((member) => member.email === participant.email)?.role ?? "member" })),
      });
    }

    const email = normalizeEmail(payload.email);
    const [team, participant] = await Promise.all([
      teams.findOne({ id: payload.teamId }, { projection: { _id: 0, id: 1, name: 1, members: 1 } }),
      participants.findOne({ team_id: payload.teamId, email, status: "ACTIVE" }),
    ]);
    if (!team || !participant) return NextResponse.json({ error: "This registration is no longer active." }, { status: 404 });

    const existingCheckIn = participant.checked_in_at;
    const checkedInAt = existingCheckIn ?? new Date();
    if (!existingCheckIn) {
      await participants.updateOne(
        { _id: participant._id, checked_in_at: { $exists: false } },
        { $set: { checked_in_at: checkedInAt, checked_in_by: scannerId } },
      );
    }

    return NextResponse.json({
      ok: true,
      scanType: "participant",
      alreadyCheckedIn: Boolean(existingCheckIn),
      checkedInAt: checkedInAt.toISOString(),
      participant: { name: participant.name, email: participant.email, rollNo: participant.roll_no, role: team.members.find((member) => member.email === participant.email)?.role ?? "member" },
      team: { id: team.id, name: team.name },
    });
  } catch (error) {
    console.error("Ignithon scan check-in failed", error);
    return NextResponse.json({ error: "Unable to complete check-in." }, { status: 500 });
  }
}
