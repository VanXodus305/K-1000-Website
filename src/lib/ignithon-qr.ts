import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const QR_VERSION = "1";
export const IGNITHON_QR_PREFIX = "K1000:IGNITHON2:";

export type IgnithonParticipantQrPayload = {
  event: "ignithon-2.0";
  kind: "participant";
  teamId: number;
  email: string;
};

export type IgnithonTeamQrPayload = {
  event: "ignithon-2.0";
  kind: "team";
  teamId: number;
  teamName: string;
};

export type IgnithonQrPayload = IgnithonParticipantQrPayload | IgnithonTeamQrPayload;

function encryptionKey() {
  const secret = process.env.IGNITHON_QR_SECRET ?? process.env.IGNITHON_SESSION_SECRET;
  if (!secret) throw new Error("IGNITHON_QR_SECRET is not configured");
  return createHash("sha256").update(secret).digest();
}

export function createIgnithonQrToken(payload: IgnithonQrPayload) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [QR_VERSION, iv.toString("base64url"), encrypted.toString("base64url"), tag.toString("base64url")].join(".");
}

export function readIgnithonQrToken(token: string): IgnithonQrPayload | null {
  try {
    const [version, ivValue, encryptedValue, tagValue] = token.split(".");
    if (version !== QR_VERSION || !ivValue || !encryptedValue || !tagValue) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]);
    const payload = JSON.parse(decrypted.toString("utf8")) as Partial<IgnithonQrPayload>;
    if (payload.event !== "ignithon-2.0" || !Number.isInteger(payload.teamId)) return null;
    if (payload.kind === "participant" && typeof payload.email === "string") return payload as IgnithonParticipantQrPayload;
    if (payload.kind === "team" && typeof payload.teamName === "string") return payload as IgnithonTeamQrPayload;
    return null;
  } catch {
    return null;
  }
}

export function getIgnithonQrValue(payload: IgnithonQrPayload) {
  return `${IGNITHON_QR_PREFIX}${createIgnithonQrToken(payload)}`;
}

export function getIgnithonTeamQrValue(payload: IgnithonTeamQrPayload) {
  return JSON.stringify({
    version: 1,
    event: payload.event,
    type: payload.kind,
    teamName: payload.teamName,
    teamId: payload.teamId,
    token: createIgnithonQrToken(payload),
  });
}

export function extractIgnithonQrToken(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("{")) {
    try {
      const decoded = JSON.parse(trimmed) as { token?: unknown };
      if (typeof decoded.token === "string") return decoded.token;
    } catch {
      return "";
    }
  }
  return trimmed.startsWith(IGNITHON_QR_PREFIX) ? trimmed.slice(IGNITHON_QR_PREFIX.length) : trimmed;
}
