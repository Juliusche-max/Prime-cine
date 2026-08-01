/**
 * Best-effort in-memory rate limiter.
 *
 * IMPORTANT: Vercel serverless/edge functions do not share memory across
 * invocations or regions, so this only throttles repeated requests that
 * happen to hit the same warm instance. It raises the bar against naive
 * scripted abuse but is NOT a substitute for a real distributed limiter.
 * For production-grade protection, swap this for Upstash Redis + 
 * @upstash/ratelimit (a few lines: same `check()` signature) or Vercel's
 * built-in Attack Challenge Mode / Firewall rules.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Periodically clear stale buckets so this doesn't leak memory on a long-lived instance.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  }, 60_000).unref?.();
}
