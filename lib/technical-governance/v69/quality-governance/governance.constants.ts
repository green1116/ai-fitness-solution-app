/**
 * V69 P6 — Quality governance constants (read-only, P1–P5 upstream)
 */
import {
  isUpstreamTechnicalStandardsLockIntact,
  V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK,
} from "../security-governance/governance.constants";
import {
  V69_SECURITY_GOVERNANCE_FREEZE_VERSION,
  V69_SECURITY_GOVERNANCE_VERSION,
} from "../security-governance/governance.types";

export const V69_QUALITY_GOVERNANCE_DOMAIN = "quality-governance" as const;

export const V69_QUALITY_GOVERNANCE_ARTIFACT_ROOT =
  "lib/technical-governance/v69/quality-governance" as const;

export type UpstreamSecurityGovernanceLock = {
  architectureCatalog: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureCatalog;
  architectureCatalogFreeze: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureCatalogFreeze;
  architectureDependency: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureDependency;
  architectureDependencyFreeze: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureDependencyFreeze;
  codeGovernance: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.codeGovernance;
  codeGovernanceFreeze: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.codeGovernanceFreeze;
  technicalStandards: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.technicalStandards;
  technicalStandardsFreeze: typeof V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.technicalStandardsFreeze;
  securityGovernance: typeof V69_SECURITY_GOVERNANCE_VERSION;
  securityGovernanceFreeze: typeof V69_SECURITY_GOVERNANCE_FREEZE_VERSION;
};

export const V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK: UpstreamSecurityGovernanceLock = {
  architectureCatalog: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureCatalog,
  architectureCatalogFreeze: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureCatalogFreeze,
  architectureDependency: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureDependency,
  architectureDependencyFreeze: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.architectureDependencyFreeze,
  codeGovernance: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.codeGovernance,
  codeGovernanceFreeze: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.codeGovernanceFreeze,
  technicalStandards: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.technicalStandards,
  technicalStandardsFreeze: V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.technicalStandardsFreeze,
  securityGovernance: V69_SECURITY_GOVERNANCE_VERSION,
  securityGovernanceFreeze: V69_SECURITY_GOVERNANCE_FREEZE_VERSION,
};

export function isUpstreamSecurityGovernanceLockIntact(): boolean {
  const lock = V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK;
  return (
    Object.values(lock).every((v) => typeof v === "string" && v.length > 0) &&
    isUpstreamTechnicalStandardsLockIntact()
  );
}

export { V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK };
