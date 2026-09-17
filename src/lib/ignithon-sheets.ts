import { after } from "next/server";

const SHEETS_SYNC_URL = "https://ignithon-v2.vercel.app/api/sheets/sync";

export async function syncIgnithonSheetsInBackground(teamId: number, action: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(JSON.stringify({ event: "ignithon_sheets_sync_skipped", action, teamId, reason: "non_production_runtime" }));
    return { skipped: true };
  }

  try {
    console.info(JSON.stringify({ event: "ignithon_sheets_sync_started", action, teamId, endpoint: SHEETS_SYNC_URL }));
    const response = await fetch(SHEETS_SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(JSON.stringify({ event: "ignithon_sheets_sync_failed", action, teamId, reason: "non_success_status", status: response.status }));
      return { synced: false };
    }
    console.info(JSON.stringify({ event: "ignithon_sheets_sync_completed", action, teamId }));
    return { synced: true };
  } catch (error) {
    console.error(JSON.stringify({ event: "ignithon_sheets_sync_failed", action, teamId, reason: error instanceof Error ? error.message : "unknown_error" }));
    return { synced: false };
  }
}

export function triggerIgnithonSheetsSync(teamId: number, action: string) {
  console.info(JSON.stringify({ event: "ignithon_sheets_sync_triggered", action, teamId }));
  after(async () => {
    const result = await syncIgnithonSheetsInBackground(teamId, action);
    console.info(JSON.stringify({
      event: "ignithon_sheets_sync_finished",
      action,
      teamId,
      outcome: result.synced ? "completed" : result.skipped ? "skipped" : "failed",
    }));
  });
}
