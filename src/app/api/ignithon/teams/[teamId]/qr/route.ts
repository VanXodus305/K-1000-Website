import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getIgnithonSession } from "@/lib/ignithon-auth";
import { getIgnithonCollections } from "@/lib/ignithon-db";
import { getIgnithonTeamQrValue } from "@/lib/ignithon-qr";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await getIgnithonSession();
  const teamId = Number((await params).teamId);
  if (!session || session.teamId !== teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { teams } = await getIgnithonCollections();
    const team = await teams.findOne({ id: teamId }, { projection: { _id: 0, id: 1, name: 1 } });
    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
    const qrValue = getIgnithonTeamQrValue({ event: "ignithon-2.0", kind: "team", teamId: team.id, teamName: team.name });
    const svg = await QRCode.toString(qrValue, { type: "svg", errorCorrectionLevel: "M", margin: 2, color: { dark: "#020202", light: "#ffffff" }, width: 512 });
    return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Ignithon team QR generation failed", error);
    return NextResponse.json({ error: "Unable to generate the team QR code." }, { status: 500 });
  }
}
