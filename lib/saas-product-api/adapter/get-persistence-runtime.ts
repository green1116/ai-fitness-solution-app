import {
  createPersistenceRuntime,
  resolvePersistenceBackend,
  type PersistenceRuntime,
} from "@/lib/saas-product-persistence";

let cachedRuntime: PersistenceRuntime | null = null;
let cachedBackend = resolvePersistenceBackend();

export function getPersistenceRuntime(): PersistenceRuntime {
  const backend = resolvePersistenceBackend();
  if (!cachedRuntime || cachedBackend !== backend) {
    cachedRuntime = createPersistenceRuntime({ backend });
    cachedBackend = backend;
  }
  return cachedRuntime;
}

export function getResolvedPersistenceBackend() {
  return cachedBackend;
}

export function resetPersistenceRuntimeForTests(): void {
  cachedRuntime = null;
  cachedBackend = resolvePersistenceBackend();
}
