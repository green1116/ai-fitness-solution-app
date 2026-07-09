/**
 * V69 P1 — Architecture catalog freeze lock (read-only)
 */
import {
  V68_PLATFORM_FREEZE_VERSION,
  V68_PLATFORM_SIGNOFF_VERSION,
} from "@/lib/platform/v68/signoff/signoff.types";

import {
  V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  V69_ARCHITECTURE_CATALOG_VERSION,
} from "./catalog.types";

export type ArchitectureCatalogFreezeLock = {
  architectureCatalog: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  architectureCatalogFreeze: typeof V69_ARCHITECTURE_CATALOG_FREEZE_VERSION;
  upstreamV68PlatformSignoff: typeof V68_PLATFORM_SIGNOFF_VERSION;
  upstreamV68PlatformFreeze: typeof V68_PLATFORM_FREEZE_VERSION;
};

export const V69_ARCHITECTURE_CATALOG_FREEZE_LOCK: ArchitectureCatalogFreezeLock = {
  architectureCatalog: V69_ARCHITECTURE_CATALOG_VERSION,
  architectureCatalogFreeze: V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  upstreamV68PlatformSignoff: V68_PLATFORM_SIGNOFF_VERSION,
  upstreamV68PlatformFreeze: V68_PLATFORM_FREEZE_VERSION,
};

export const EXPECTED_ARCHITECTURE_CATALOG_FREEZE_LOCK: ArchitectureCatalogFreezeLock =
  V69_ARCHITECTURE_CATALOG_FREEZE_LOCK;

export function isArchitectureCatalogFreezeLockIntact(): boolean {
  const lock = V69_ARCHITECTURE_CATALOG_FREEZE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function architectureCatalogFreezeLockMatchesExpected(): boolean {
  const lock = V69_ARCHITECTURE_CATALOG_FREEZE_LOCK;
  const expected = EXPECTED_ARCHITECTURE_CATALOG_FREEZE_LOCK;
  return (Object.keys(lock) as Array<keyof ArchitectureCatalogFreezeLock>).every(
    (key) => lock[key] === expected[key],
  );
}
