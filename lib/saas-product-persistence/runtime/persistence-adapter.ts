import type {
  CreatePersistenceRuntimeOptions,
  PersistenceRuntime,
} from "../shared/persistence-types";
import {
  createMemoryPersistenceRuntime,
  createPrismaPersistenceRuntime,
  resolvePersistenceBackend,
} from "./persistence-backend";

export type { PersistenceRuntime } from "../shared/persistence-types";

export function createPersistenceRuntime(
  options: CreatePersistenceRuntimeOptions = {},
): PersistenceRuntime {
  const backend = resolvePersistenceBackend(options.backend);
  if (backend === "prisma") {
    return createPrismaPersistenceRuntime();
  }
  return createMemoryPersistenceRuntime();
}

export { resolvePersistenceBackend } from "./persistence-backend";
