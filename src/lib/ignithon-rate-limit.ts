const attempts = new Map<string, { count: number; resetAt: number }>();
export const STRICT_RATE_LIMIT = 3;
export const STRICT_RATE_WINDOW_MS = 10 * 60_000;
export const DEVICE_COOKIE_NAME = "ignithon_device_id";

export function checkRateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    if (current) attempts.delete(key);
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

export function getClientDeviceId(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value && /^[a-zA-Z0-9-]{16,128}$/.test(value) ? value : null;
}

export function checkStrictRateLimit(key: string) {
  return checkRateLimit(key, STRICT_RATE_LIMIT, STRICT_RATE_WINDOW_MS);
}

export function rateLimitResponse(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(STRICT_RATE_WINDOW_MS / 1000) },
  });
}
