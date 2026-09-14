import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isKiitEmailDomain } from "./ignithon-identity";

const COOKIE_NAME = "ignithon_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 120;

export type IgnithonSession = {
  email: string;
  teamId: number;
  role: "leader" | "member";
  expiresAt: number;
};

function getSecret() {
  const secret = process.env.IGNITHON_SESSION_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) throw new Error("IGNITHON_SESSION_SECRET is not configured");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export async function setIgnithonSession(session: Omit<IgnithonSession, "expiresAt">) {
  const payload: IgnithonSession = {
    ...session,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  (await cookies()).set(COOKIE_NAME, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getIgnithonSession(): Promise<IgnithonSession | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return null;

  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as IgnithonSession;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export async function clearIgnithonSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isKiitEmail = (email: string) => isKiitEmailDomain(normalizeEmail(email));
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));

export const getKiitRollNumber = (email: string) => {
  if (!isKiitEmail(email)) return null;
  const localPart = normalizeEmail(email).split("@")[0];
  return /^\d+$/.test(localPart) ? localPart : null;
};

export const hasValidRegistrationIdentity = (email: string, rollNo: string | undefined) => {
  if (!isValidEmail(email) || !isKiitEmail(email) || typeof rollNo !== "string" || !/^\d+$/.test(rollNo) || Number(rollNo) <= 0) return false;
  const kiitRollNumber = getKiitRollNumber(email);
  return kiitRollNumber === null || kiitRollNumber === rollNo;
};
