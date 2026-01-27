// lib/redis.ts
import Redis from "ioredis";

export const runtime = "nodejs";

const url = process.env.REDIS_URL;

// ✅ 生产环境：必须有 REDIS_URL
if (!url && process.env.NODE_ENV === "production") {
  throw new Error("REDIS_URL is missing");
}

// ✅ 开发环境：fallback 到内存 Map
let client: any;

if (url) {
  // 你原来的 redis client 初始化逻辑
  let redisInstance: Redis | null = null;
  let useMemoryStore = false;

  // 内存存储 fallback（仅用于开发环境，Redis 不可用时）
  declare global {
    var __MEMORY_STORE: Map<string, { value: string; exp: number }> | undefined;
  }
  const memoryStore = globalThis.__MEMORY_STORE || (globalThis.__MEMORY_STORE = new Map());

  // 检查 Redis 连接状态
  function checkRedisConnection() {
    if (useMemoryStore) return false;
    if (!redisInstance) return false;
    return true;
  }

  try {
    redisInstance = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn("[Redis] 连接失败，切换到内存存储模式（仅开发环境）");
          useMemoryStore = true;
          return null;
        }
        return Math.min(times * 50, 2000);
      },
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      enableOfflineQueue: false,
    });

    redisInstance.on("error", (err) => {
      const errorMsg = err.message || "";
      if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("connect") || errorMsg.includes("ENOTFOUND") || errorMsg.includes("ECONNRESET")) {
        console.warn("[Redis] 连接失败，切换到内存存储模式（仅开发环境）:", errorMsg);
        useMemoryStore = true;
      }
    });

    redisInstance.on("connect", () => {
      console.log("[Redis] 连接成功");
      useMemoryStore = false;
    });

    redisInstance.connect().catch((e) => {
      console.warn("[Redis] 初始连接失败，切换到内存存储模式（仅开发环境）:", e?.message);
      useMemoryStore = true;
    });
  } catch (e: any) {
    console.warn("[Redis] 初始化失败，切换到内存存储模式（仅开发环境）:", e?.message);
    useMemoryStore = true;
    redisInstance = null;
  }

  // 清理过期项
  function cleanupExpired() {
    const now = Date.now();
    for (const [key, item] of memoryStore.entries()) {
      if (now > item.exp) {
        memoryStore.delete(key);
      }
    }
  }

  client = {
    async get(key: string): Promise<string | null> {
      if (useMemoryStore || !checkRedisConnection()) {
        cleanupExpired();
        const item = memoryStore.get(key);
        if (!item) return null;
        if (Date.now() > item.exp) {
          memoryStore.delete(key);
          return null;
        }
        return item.value;
      }
      try {
        return await redisInstance!.get(key);
      } catch (e) {
        console.warn("[Redis] get 操作失败，切换到内存存储:", e);
        useMemoryStore = true;
        cleanupExpired();
        const item = memoryStore.get(key);
        return item ? item.value : null;
      }
    },

    async set(key: string, value: string, ...args: any[]): Promise<void> {
      if (useMemoryStore || !checkRedisConnection()) {
        const ttl = args.length >= 2 && args[0] === "EX" ? Number(args[1]) : 0;
        memoryStore.set(key, {
          value,
          exp: ttl ? Date.now() + ttl * 1000 : Date.now() + 3600000,
        });
        return;
      }
      try {
        await redisInstance!.set(key, value, ...args);
      } catch (e) {
        console.warn("[Redis] set 操作失败，切换到内存存储:", e);
        useMemoryStore = true;
        const ttl = args.length >= 2 && args[0] === "EX" ? Number(args[1]) : 0;
        memoryStore.set(key, {
          value,
          exp: ttl ? Date.now() + ttl * 1000 : Date.now() + 3600000,
        });
      }
    },

    async del(...keys: string[]): Promise<void> {
      if (useMemoryStore || !checkRedisConnection()) {
        keys.forEach((k) => memoryStore.delete(k));
        return;
      }
      await redisInstance!.del(...keys);
    },

    async incr(key: string): Promise<number> {
      if (useMemoryStore || !checkRedisConnection()) {
        cleanupExpired();
        const item = memoryStore.get(key);
        const newVal = item ? Number(item.value) + 1 : 1;
        const existingItem = memoryStore.get(key);
        const exp = existingItem?.exp || Date.now() + 3600000;
        memoryStore.set(key, { value: String(newVal), exp });
        return newVal;
      }
      try {
        return await redisInstance!.incr(key);
      } catch (e) {
        console.warn("[Redis] incr 操作失败，切换到内存存储:", e);
        useMemoryStore = true;
        cleanupExpired();
        const item = memoryStore.get(key);
        const newVal = item ? Number(item.value) + 1 : 1;
        const existingItem = memoryStore.get(key);
        const exp = existingItem?.exp || Date.now() + 3600000;
        memoryStore.set(key, { value: String(newVal), exp });
        return newVal;
      }
    },

    async expire(key: string, seconds: number): Promise<void> {
      if (useMemoryStore || !checkRedisConnection()) {
        const item = memoryStore.get(key);
        if (item) {
          item.exp = Date.now() + seconds * 1000;
        }
        return;
      }
      await redisInstance!.expire(key, seconds);
    },
  };
} else {
  console.warn("[Redis] REDIS_URL missing, using in-memory fallback");
  const store = new Map<string, { value: any; exp?: number }>();

  // 清理过期项
  function cleanupExpired() {
    const now = Date.now();
    for (const [key, item] of store.entries()) {
      if (item.exp && now > item.exp) {
        store.delete(key);
      }
    }
  }

  client = {
    async get(key: string) {
      cleanupExpired();
      const item = store.get(key);
      if (!item) return null;
      if (item.exp && Date.now() > item.exp) {
        store.delete(key);
        return null;
      }
      return item.value ?? null;
    },
    async set(key: string, value: any, ...args: any[]) {
      const ttl = args.length >= 2 && args[0] === "EX" ? Number(args[1]) : 0;
      store.set(key, {
        value,
        exp: ttl ? Date.now() + ttl * 1000 : undefined,
      });
      return "OK";
    },
    async del(...keys: string[]) {
      keys.forEach(k => store.delete(k));
      return keys.length;
    },
    async incr(key: string) {
      cleanupExpired();
      const item = store.get(key);
      const v = item ? Number(item.value || 0) + 1 : 1;
      store.set(key, {
        value: String(v),
        exp: item?.exp,
      });
      return v;
    },
    async expire(key: string, seconds: number) {
      const item = store.get(key);
      if (item) {
        item.exp = Date.now() + seconds * 1000;
      }
    },
  };
}

export const redis = client;
