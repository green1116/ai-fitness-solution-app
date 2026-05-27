/**
 * Process-local memo for enterprise foundation builders.
 * Transparent cache — same inputs yield same outputs; no logic change.
 */

const stores = new Map<string, Map<string, unknown>>();

export function memoFoundation<T>(
  namespace: string,
  deploymentId: string,
  build: () => T,
): T {
  let cache = stores.get(namespace);
  if (!cache) {
    cache = new Map<string, unknown>();
    stores.set(namespace, cache);
  }
  const hit = cache.get(deploymentId);
  if (hit !== undefined) {
    return hit as T;
  }
  const built = build();
  cache.set(deploymentId, built);
  return built;
}

export function resetFoundationMemoCaches(): void {
  stores.clear();
}
