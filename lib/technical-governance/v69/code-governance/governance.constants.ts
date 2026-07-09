/**
 * V69 P3 — Code governance constants (read-only, P1–P2 upstream)
 */
import {
  V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  V69_ARCHITECTURE_CATALOG_VERSION,
} from "../architecture-catalog/catalog.types";
import {
  isUpstreamArchitectureCatalogLockIntact,
  V69_UPSTREAM_ARCHITECTURE_CATALOG_LOCK,
} from "../architecture-dependency/dependency.constants";
import {
  V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION,
  V69_ARCHITECTURE_DEPENDENCY_VERSION,
} from "../architecture-dependency/dependency.types";

export const V69_CODE_GOVERNANCE_DOMAIN = "code-governance" as const;

export const V69_CODE_GOVERNANCE_ARTIFACT_ROOT =
  "lib/technical-governance/v69/code-governance" as const;

export type UpstreamArchitectureDependencyLock = {
  architectureCatalog: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  architectureCatalogFreeze: typeof V69_ARCHITECTURE_CATALOG_FREEZE_VERSION;
  architectureDependency: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  architectureDependencyFreeze: typeof V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION;
};

export const V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK: UpstreamArchitectureDependencyLock = {
  architectureCatalog: V69_ARCHITECTURE_CATALOG_VERSION,
  architectureCatalogFreeze: V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  architectureDependency: V69_ARCHITECTURE_DEPENDENCY_VERSION,
  architectureDependencyFreeze: V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION,
};

export function isUpstreamArchitectureDependencyLockIntact(): boolean {
  const lock = V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK;
  return (
    Object.values(lock).every((v) => typeof v === "string" && v.length > 0) &&
    isUpstreamArchitectureCatalogLockIntact()
  );
}

export { V69_UPSTREAM_ARCHITECTURE_CATALOG_LOCK };
