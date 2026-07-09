/**
 * V69 P5 — Security governance constants (read-only, P1–P4 upstream)
 */
import {
  isUpstreamCodeGovernanceLockIntact,
  V69_UPSTREAM_CODE_GOVERNANCE_LOCK,
} from "../technical-standards/standards.constants";
import {
  V69_TECHNICAL_STANDARDS_FREEZE_VERSION,
  V69_TECHNICAL_STANDARDS_VERSION,
} from "../technical-standards/standards.types";

export const V69_SECURITY_GOVERNANCE_DOMAIN = "security-governance" as const;

export const V69_SECURITY_GOVERNANCE_ARTIFACT_ROOT =
  "lib/technical-governance/v69/security-governance" as const;

export type UpstreamTechnicalStandardsLock = {
  architectureCatalog: typeof V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureCatalog;
  architectureCatalogFreeze: typeof V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureCatalogFreeze;
  architectureDependency: typeof V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureDependency;
  architectureDependencyFreeze: typeof V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureDependencyFreeze;
  codeGovernance: typeof V69_UPSTREAM_CODE_GOVERNANCE_LOCK.codeGovernance;
  codeGovernanceFreeze: typeof V69_UPSTREAM_CODE_GOVERNANCE_LOCK.codeGovernanceFreeze;
  technicalStandards: typeof V69_TECHNICAL_STANDARDS_VERSION;
  technicalStandardsFreeze: typeof V69_TECHNICAL_STANDARDS_FREEZE_VERSION;
};

export const V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK: UpstreamTechnicalStandardsLock = {
  architectureCatalog: V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureCatalog,
  architectureCatalogFreeze: V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureCatalogFreeze,
  architectureDependency: V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureDependency,
  architectureDependencyFreeze: V69_UPSTREAM_CODE_GOVERNANCE_LOCK.architectureDependencyFreeze,
  codeGovernance: V69_UPSTREAM_CODE_GOVERNANCE_LOCK.codeGovernance,
  codeGovernanceFreeze: V69_UPSTREAM_CODE_GOVERNANCE_LOCK.codeGovernanceFreeze,
  technicalStandards: V69_TECHNICAL_STANDARDS_VERSION,
  technicalStandardsFreeze: V69_TECHNICAL_STANDARDS_FREEZE_VERSION,
};

export function isUpstreamTechnicalStandardsLockIntact(): boolean {
  const lock = V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK;
  return (
    Object.values(lock).every((v) => typeof v === "string" && v.length > 0) &&
    isUpstreamCodeGovernanceLockIntact()
  );
}

export { V69_UPSTREAM_CODE_GOVERNANCE_LOCK };
