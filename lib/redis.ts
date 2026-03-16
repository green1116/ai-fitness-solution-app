import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __MEMORY_STORE:
    | Map<string, { value: string; exp: number }>
    | undefined;
}

type MemoryEntry = {
  value: string;
  exp: number;
};

const memoryStore: Map<string, MemoryEntry> =
  globalThis.__MEMORY_STORE || (globalThis.__MEMORY_STORE = new Map());

let redisClient: Redis | null = null;

function getRedisUrl(): string | null {
  const url =
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_URL ||
    process.env.KV_URL ||
    "";

  return url.trim() ? url.trim() : null;
}

function nowMs() {
  return Date.now();
}

function cleanupMemoryKey(key: string) {
  const item = memoryStore.get(key);
  if (!item) return;
  if (item.exp <= nowMs()) {
    memoryStore.delete(key);
  }
}

function ensureRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = getRedisUrl();
  if (!url) return null;

  try {
    redisClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
    });
    return redisClient;
  } catch (err) {
    console.warn("[redis] init failed, fallback to memory:", err);
    redisClient = null;
    return null;
  }
}

async function tryConnect(client: Redis) {
  try {
    if (client.status !== "ready" && client.status !== "connect") {
      await client.connect().catch(() => {});
    }
  } catch {
    // ignore
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const client = ensureRedisClient();

  if (client) {
    try {
      await tryConnect(client);
      return await client.get(key);
    } catch (err) {
      console.warn("[redis] get failed, fallback to memory:", err);
    }
  }

  cleanupMemoryKey(key);
  return memoryStore.get(key)?.value ?? null;
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<"OK"> {
  const client = ensureRedisClient();

  if (client) {
    try {
      await tryConnect(client);
      if (typeof ttlSeconds === "number" && ttlSeconds > 0) {
        await client.set(key, value, "EX", ttlSeconds);
      } else {
        await client.set(key, value);
      }
      return "OK";
    } catch (err) {
      console.warn("[redis] set failed, fallback to memory:", err);
    }
  }

  memoryStore.set(key, {
    value,
    exp:
      nowMs() +
      (typeof ttlSeconds === "number" && ttlSeconds > 0
        ? ttlSeconds * 1000
        : 365 * 24 * 3600 * 1000),
  });

  return "OK";
}

export async function redisDel(key: string): Promise<number> {
  const client = ensureRedisClient();

  if (client) {
    try {
      await tryConnect(client);
      return await client.del(key);
    } catch (err) {
      console.warn("[redis] del failed, fallback to memory:", err);
    }
  }

  const existed = memoryStore.has(key);
  memoryStore.delete(key);
  return existed ? 1 : 0;
}

export async function redisExpire(
  key: string,
  ttlSeconds: number
): Promise<number> {
  const client = ensureRedisClient();

  if (client) {
    try {
      await tryConnect(client);
      return await client.expire(key, ttlSeconds);
    } catch (err) {
      console.warn("[redis] expire failed, fallback to memory:", err);
    }
  }

  cleanupMemoryKey(key);
  const item = memoryStore.get(key);
  if (!item) return 0;

  memoryStore.set(key, {
    ...item,
    exp: nowMs() + ttlSeconds * 1000,
  });
  return 1;
}

export async function redisIncr(key: string): Promise<number> {
  const client = ensureRedisClient();

  if (client) {
    try {
      await tryConnect(client);
      return await client.incr(key);
    } catch (err) {
      console.warn("[redis] incr failed, fallback to memory:", err);
    }
  }

  cleanupMemoryKey(key);
  const prev = memoryStore.get(key);
  const current = prev ? Number(prev.value || "0") : 0;
  const next = current + 1;

  memoryStore.set(key, {
    value: String(next),
    exp: prev?.exp ?? nowMs() + 365 * 24 * 3600 * 1000,
  });

  return next;
}

/**
 * 兼容旧项目调用方式：
 * import { redis } from "@/lib/redis"
 * redis.get / redis.set / redis.del / redis.incr / redis.expire
 */
export const redis = {
  get: redisGet,
  set: redisSet,
  del: redisDel,
  incr: redisIncr,
  expire: redisExpire,
};

export function getRedisClient(): Redis | null {
  return ensureRedisClient();
}

export default redis;