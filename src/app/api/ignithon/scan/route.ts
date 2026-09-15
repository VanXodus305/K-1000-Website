import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { hasValidApiKey } from "@/lib/ignithon-api-key";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { readIgnithonParticipantQrValue } from "@/lib/ignithon-qr";
import { checkRateLimit, getClientDeviceId } from "@/lib/ignithon-rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const scannerKey = request.headers.get("x-ignithon-scanner-key");
  if (!hasValidApiKey(scannerKey, process.env.IGNITHON_SCANNER_KEY)) return NextResponse.json({ error: "Unauthorized scanner." }, { status: 401 });
  try {
    const body = await request.json() as { token?: unknown; scannerId?: unknown };
    if (typeof body.token !== "string") return NextResponse.json({ error: "QR identity is required." }, { status: 400 });
    const scannerId = typeof body.scannerId === "string" && /^[a-zA-Z0-9:_-]{8,128}$/.test(body.scannerId) ? body.scannerId : getClientDeviceId(request);
    if (scannerId && !(await checkRateLimit(`scan:${scannerId}`, 600, 60_000))) return NextResponse.json({ error: "Too many scan requests." }, { status: 429, headers: { "Retry-After": "60" } });
    const identity = readIgnithonParticipantQrValue(body.token);
    if (!identity) return NextResponse.json({ error: "Invalid Ignithon participant QR code." }, { status: 400 });

    const { teams, participants } = await getIgnithonCollections();
    const team = await teams.findOne({ id: identity.teamId });
    const participant = team && ObjectId.isValid(identity.participantId)
      ? await participants.findOne({ _id: new ObjectId(identity.participantId), team_id: team._id, status: "ACTIVE" })
      : null;
    if (!team || !participant || !team.members.some((memberId) => memberId.equals(participant._id))) {
      return NextResponse.json({ error: "This registration is no longer active." }, { status: 404 });
    }

    const alreadyCheckedIn = participant.attendance === true;
    if (!alreadyCheckedIn) {
      await participants.updateOne(
        { _id: participant._id, attendance: { $ne: true } },
        { $set: { attendance: true, updatedAt: new Date() } },
      );
    }

    return NextResponse.json({
      ok: true,
      scanType: "participant",
      alreadyCheckedIn,
      attendance: true,
      participant: { name: participant.name, email: participant.email, rollNo: participant.roll_no, role: team.members[0]?.equals(participant._id) ? "leader" : "member" },
      team: { id: team.id, name: team.name },
    });
  } catch (error) {
    console.error("Ignithon scan check-in failed", error);
    return NextResponse.json({ error: "Unable to complete check-in." }, { status: 500 });
  }
}
