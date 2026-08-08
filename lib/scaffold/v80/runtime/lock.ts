/** V80 CODE P3 — per-key async mutex (concurrency safety) */
const chains = new Map<string, Promise<unknown>>();

export async function withV80Lock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(key) ?? Promise.resolve();
  const run = prev.catch(() => undefined).then(fn);
  chains.set(
    key,
    run.catch(() => undefined),
  );
  try {
    return await run;
  } finally {
    if (chains.get(key) === run) chains.delete(key);
  }
}
