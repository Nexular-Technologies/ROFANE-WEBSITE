import { NextResponse } from "next/server";

/**
 * Small in-memory sliding-window rate limiter.
 *
 * The site runs as a single container, so an in-process map is enough and
 * avoids adding a datastore. Counters reset on redeploy, which is acceptable
 * for abuse protection (brute force, signup/email flooding, upload spam).
 */
type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();
let lastSweep = Date.now();

function sweep(now: number) {
  // Drop expired entries occasionally so the map can't grow unbounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

/**
 * The app sits behind Coolify's reverse proxy, so the client address comes
 * from the forwarding headers it sets. Only the first hop is used, and an
 * unknown value still gets a (shared) bucket rather than bypassing limits.
 */
export function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim();
  return ip || "unknown";
}

export function checkRateLimit(name: string, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);

  const bucketKey = `${name}:${key}`;
  const existing = buckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export function rateLimitResponse(
  request: Request,
  name: string,
  limit: number,
  windowMs: number
) {
  const { allowed, retryAfterSeconds } = checkRateLimit(name, clientKey(request), limit, windowMs);
  if (allowed) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
