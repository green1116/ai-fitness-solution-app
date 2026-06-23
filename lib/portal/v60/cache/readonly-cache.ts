/**
 * V60 P9 — Read-only TTL cache (does not affect write correctness)
 */

type CacheEntry<T> = { value: T; expiresAt: number };

const cache = new Map<string, CacheEntry<unknown>>();

export const READONLY_CACHE_TTL_MS = {
  workspaceSummary: 15_000,
  documentSummary: 15_000,
  deliverySummary: 15_000,
  intelligenceSummary: 30_000,
  executiveDashboard: 30_000,
  productionAudit: 60_000,
} as const;

export async function withReadonlyCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }
  const value = await loader();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidateReadonlyCache(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function getReadonlyCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: [...cache.keys()].slice(0, 50) };
}
