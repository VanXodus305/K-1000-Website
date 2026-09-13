import { timingSafeEqual } from "node:crypto";

export function hasValidApiKey(supplied: string | null, expected: string | undefined) {
  if (!supplied || !expected) return false;
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function configuredAdminKeys() {
  const namedKeys = (process.env.IGNITHON_ADMIN_KEYS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf(":");
      return separator > 0 ? { name: entry.slice(0, separator), value: entry.slice(separator + 1) } : { name: "admin", value: entry };
    });
  const legacyKey = process.env.IGNITHON_ADMIN_KEY;
  return legacyKey ? [{ name: "legacy-admin", value: legacyKey }, ...namedKeys] : namedKeys;
}

export function getAdminKeyOwner(supplied: string | null) {
  return configuredAdminKeys().find((entry) => hasValidApiKey(supplied, entry.value))?.name ?? null;
}

export function hasValidAdminKey(supplied: string | null) {
  return getAdminKeyOwner(supplied) !== null;
}
