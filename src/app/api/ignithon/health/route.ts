import { NextResponse } from "next/server";
import { pingMongoDb } from "@/lib/mongodb";

export async function GET() {
  try {
    return NextResponse.json(await pingMongoDb());
  } catch (error) {
    console.error("Ignithon MongoDB ping failed", error);
    return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
  }
}
