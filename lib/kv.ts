// lib/kv.ts
type SetOpts = { ex?: number }; // seconds

function createMemoryKV() {
  const store = new Map<string, { v: string; exp: number | null }>();

  return {
    async get(key: string) {
      const it = store.get(key);
      if (!it) return null;
      if (it.exp && Date.now() > it.exp) {
        store.delete(key);
        return null;
      }
      return it.v;
    },
    async set(key: string, value: string, opts?: SetOpts) {
      const exp = opts?.ex ? Date.now() + opts.ex * 1000 : null;
      store.set(key, { v: value, exp });
      return "OK";
    },
    async del(...keys: string[]) {
      keys.forEach((k) => store.delete(k));
      return keys.length;
    },
    async incr(key: string) {
      const cur = Number((await this.get(key)) || 0) + 1;
      await this.set(key, String(cur));
      return cur;
    },
  };
}

let _kv: any;

export async function kv() {
  if (_kv) return _kv;

  const url = process.env.REDIS_URL;
  if (url) {
    // ✅ 只有在有 REDIS_URL 时才去加载 redis 客户端（避免 import 阶段炸）
    const { redis } = await import("@/lib/redis");
    _kv = redis;
    return _kv;
  }

  console.warn("[KV] REDIS_URL missing, using in-memory fallback");
  _kv = createMemoryKV();
  return _kv;
}

