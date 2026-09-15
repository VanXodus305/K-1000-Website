const SHEETS_SYNC_URL = "https://ignithon-v2.vercel.app/api/sheets/sync";

export async function syncIgnithonSheetsAfterTeamCreation() {
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
      console.error("Ignithon Sheets sync returned a non-success status", response.status);
      return { synced: false };
    }
    return { synced: true };
  } catch (error) {
    console.error("Ignithon Sheets sync failed after team creation", error);
    return { synced: false };
  }
}
