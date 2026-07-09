/**
 * V69 P4 — Technical standards constants (read-only, P1–P3 upstream)
 */
import {
  V69_CODE_GOVERNANCE_FREEZE_VERSION,
  V69_CODE_GOVERNANCE_VERSION,
} from "../code-governance/governance.types";
import {
  isUpstreamArchitectureDependencyLockIntact,
  V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK,
} from "../code-governance/governance.constants";

export const V69_TECHNICAL_STANDARDS_DOMAIN = "technical-standards" as const;

export const V69_TECHNICAL_STANDARDS_ARTIFACT_ROOT =
  "lib/technical-governance/v69/technical-standards" as const;

export type UpstreamCodeGovernanceLock = {
  architectureCatalog: typeof V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureCatalog;
  architectureCatalogFreeze: typeof V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureCatalogFreeze;
  architectureDependency: typeof V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureDependency;
  architectureDependencyFreeze: typeof V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureDependencyFreeze;
  codeGovernance: typeof V69_CODE_GOVERNANCE_VERSION;
  codeGovernanceFreeze: typeof V69_CODE_GOVERNANCE_FREEZE_VERSION;
};

export const V69_UPSTREAM_CODE_GOVERNANCE_LOCK: UpstreamCodeGovernanceLock = {
  architectureCatalog: V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureCatalog,
  architectureCatalogFreeze: V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureCatalogFreeze,
  architectureDependency: V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureDependency,
  architectureDependencyFreeze: V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureDependencyFreeze,
  codeGovernance: V69_CODE_GOVERNANCE_VERSION,
  codeGovernanceFreeze: V69_CODE_GOVERNANCE_FREEZE_VERSION,
};

export function isUpstreamCodeGovernanceLockIntact(): boolean {
  const lock = V69_UPSTREAM_CODE_GOVERNANCE_LOCK;
  return (
    Object.values(lock).every((v) => typeof v === "string" && v.length > 0) &&
    isUpstreamArchitectureDependencyLockIntact()
  );
}

export { V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK };
