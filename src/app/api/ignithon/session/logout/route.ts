import { NextResponse } from "next/server";
import { clearIgnithonSession } from "@/lib/ignithon-auth";

export async function POST() {
  await clearIgnithonSession();
  return NextResponse.json({ ok: true });
}
