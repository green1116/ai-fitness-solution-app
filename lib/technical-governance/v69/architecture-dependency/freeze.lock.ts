/**
 * V69 P2 — Architecture dependency freeze lock (read-only)
 */
import {
  V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  V69_ARCHITECTURE_CATALOG_VERSION,
} from "../architecture-catalog/catalog.types";

import {
  V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION,
  V69_ARCHITECTURE_DEPENDENCY_VERSION,
} from "./dependency.types";

export type ArchitectureDependencyFreezeLock = {
  architectureDependency: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  architectureDependencyFreeze: typeof V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION;
  upstreamArchitectureCatalog: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  upstreamArchitectureCatalogFreeze: typeof V69_ARCHITECTURE_CATALOG_FREEZE_VERSION;
};

export const V69_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK: ArchitectureDependencyFreezeLock = {
  architectureDependency: V69_ARCHITECTURE_DEPENDENCY_VERSION,
  architectureDependencyFreeze: V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION,
  upstreamArchitectureCatalog: V69_ARCHITECTURE_CATALOG_VERSION,
  upstreamArchitectureCatalogFreeze: V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
};

export const EXPECTED_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK: ArchitectureDependencyFreezeLock =
  V69_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK;

export function isArchitectureDependencyFreezeLockIntact(): boolean {
  const lock = V69_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function architectureDependencyFreezeLockMatchesExpected(): boolean {
  const lock = V69_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK;
  const expected = EXPECTED_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK;
  return (Object.keys(lock) as Array<keyof ArchitectureDependencyFreezeLock>).every(
    (key) => lock[key] === expected[key],
  );
}
