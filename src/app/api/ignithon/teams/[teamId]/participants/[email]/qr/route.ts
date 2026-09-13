import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getIgnithonSession, normalizeEmail } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { getIgnithonQrValue } from "@/lib/ignithon-qr";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string; email: string }> }) {
  const session = await getIgnithonSession();
  const { teamId: rawTeamId, email: rawEmail } = await params;
  const teamId = Number(rawTeamId);
  const email = normalizeEmail(decodeURIComponent(rawEmail));
  const canView = session?.teamId === teamId && (session.role === "leader" || session.email === email);
  if (!canView) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { participants } = await getIgnithonCollections();
    const participant = await participants.findOne({ team_id: teamId, email, status: "ACTIVE" }, { projection: { _id: 1 } });
    if (!participant) return NextResponse.json({ error: "Active participant not found." }, { status: 404 });
    const qrValue = getIgnithonQrValue({ event: "ignithon-2.0", kind: "participant", teamId, email });
    const svg = await QRCode.toString(qrValue, { type: "svg", errorCorrectionLevel: "M", margin: 2, color: { dark: "#020202", light: "#ffffff" }, width: 512 });
    return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Ignithon QR generation failed", error);
    return NextResponse.json({ error: "Unable to generate this QR code." }, { status: 500 });
  }
}
