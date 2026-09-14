import { NextRequest, NextResponse } from "next/server";
import { hasValidApiKey } from "@/lib/ignithon-api-key";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { readIgnithonParticipantQrValue } from "@/lib/ignithon-qr";
import { checkRateLimit } from "@/lib/ignithon-rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const scannerKey = request.headers.get("x-ignithon-scanner-key");
  if (!hasValidApiKey(scannerKey, process.env.IGNITHON_SCANNER_KEY)) return NextResponse.json({ error: "Unauthorized scanner." }, { status: 401 });
  if (!checkRateLimit(`scan:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 120)) return NextResponse.json({ error: "Too many scan requests." }, { status: 429 });

  try {
    const body = await request.json() as { token?: unknown; scannerId?: unknown };
    if (typeof body.token !== "string") return NextResponse.json({ error: "QR identity is required." }, { status: 400 });
    const identity = readIgnithonParticipantQrValue(body.token);
    if (!identity) return NextResponse.json({ error: "Invalid Ignithon participant QR code." }, { status: 400 });

    const scannerId = typeof body.scannerId === "string" ? body.scannerId.trim().slice(0, 80) : "scanner";
    const { teams, participants } = await getIgnithonCollections();
    const [team, participant] = await Promise.all([
      teams.findOne({ id: identity.teamId }, { projection: { _id: 0, id: 1, name: 1, members: 1 } }),
      participants.findOne({ team_id: identity.teamId, roll_no: identity.rollNo, qr_separator: identity.separator, status: "ACTIVE" }),
    ]);
    if (!team || !participant || !team.members.some((memberId) => memberId.equals(participant._id))) {
      return NextResponse.json({ error: "This registration is no longer active." }, { status: 404 });
    }

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
      participant: { name: participant.name, email: participant.email, rollNo: participant.roll_no, role: team.members[0]?.equals(participant._id) ? "leader" : "member" },
      team: { id: team.id, name: team.name },
    });
  } catch (error) {
    console.error("Ignithon scan check-in failed", error);
    return NextResponse.json({ error: "Unable to complete check-in." }, { status: 500 });
  }
}
