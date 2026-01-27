// lib/ratelimit.ts
import { redis } from "@/lib/redis";

export async function incrWithTtl(key: string, ttlSeconds: number) {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, ttlSeconds);
  return n;
}

export async function enforceLimit(key: string, ttlSeconds: number, max: number) {
  const n = await incrWithTtl(key, ttlSeconds);
  return { ok: n <= max, used: n, max };
}

