/**
 * V69 P2 — Architecture dependency constants (read-only, P1 upstream)
 */
import {
  V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  V69_ARCHITECTURE_CATALOG_VERSION,
} from "../architecture-catalog/catalog.types";
import {
  isUpstreamFrozenTechnicalGovernanceLockIntact,
  V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK,
} from "../architecture-catalog/catalog.constants";

export const V69_ARCHITECTURE_DEPENDENCY_DOMAIN = "architecture-dependency" as const;

export const V69_ARCHITECTURE_DEPENDENCY_ARTIFACT_ROOT =
  "lib/technical-governance/v69/architecture-dependency" as const;

export type UpstreamArchitectureCatalogLock = {
  architectureCatalog: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  architectureCatalogFreeze: typeof V69_ARCHITECTURE_CATALOG_FREEZE_VERSION;
};

export const V69_UPSTREAM_ARCHITECTURE_CATALOG_LOCK: UpstreamArchitectureCatalogLock = {
  architectureCatalog: V69_ARCHITECTURE_CATALOG_VERSION,
  architectureCatalogFreeze: V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
};

export function isUpstreamArchitectureCatalogLockIntact(): boolean {
  const lock = V69_UPSTREAM_ARCHITECTURE_CATALOG_LOCK;
  return (
    Object.values(lock).every((v) => typeof v === "string" && v.length > 0) &&
    isUpstreamFrozenTechnicalGovernanceLockIntact()
  );
}

export { V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK };
