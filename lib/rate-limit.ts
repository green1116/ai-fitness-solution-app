// lib/rate-limit.ts
type Hit = { ts: number };

const buckets = new Map<string, Hit[]>();

function now() {
  return Date.now();
}

function prune(arr: Hit[], windowMs: number) {
  const cutoff = now() - windowMs;
  let i = 0;
  while (i < arr.length && arr[i].ts < cutoff) i++;
  if (i > 0) arr.splice(0, i);
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const arr = buckets.get(key) || [];
  prune(arr, windowMs);

  if (arr.length >= limit) {
    const oldest = arr[0]?.ts ?? now();
    const retryAfterMs = Math.max(0, oldest + windowMs - now());
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
    };
  }

  arr.push({ ts: now() });
  buckets.set(key, arr);

  return {
    ok: true,
    remaining: Math.max(0, limit - arr.length),
    retryAfterSec: 0,
  };
}

