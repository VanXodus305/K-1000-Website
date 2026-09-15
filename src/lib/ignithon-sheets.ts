const SHEETS_SYNC_URL = "https://ignithon-v2.vercel.app/api/sheets/sync";

export async function syncIgnithonSheetsAfterTeamCreation(teamId?: number) {
  if (process.env.NODE_ENV !== "production") return { skipped: true };

  try {
    const response = await fetch(SHEETS_SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(JSON.stringify({ event: "ignithon_sheets_sync_failed", teamId, reason: "non_success_status", status: response.status }));
      return { synced: false };
    }
    console.info(JSON.stringify({ event: "ignithon_sheets_sync_completed", teamId }));
    return { synced: true };
  } catch (error) {
    console.error(JSON.stringify({ event: "ignithon_sheets_sync_failed", teamId, reason: error instanceof Error ? error.message : "unknown_error" }));
    return { synced: false };
  }
}
