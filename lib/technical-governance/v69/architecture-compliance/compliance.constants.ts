/**
 * V69 P7 — Architecture compliance constants (read-only, P1–P6 upstream)
 */
import {
  isUpstreamSecurityGovernanceLockIntact,
  V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK,
} from "../quality-governance/governance.constants";
import {
  V69_QUALITY_GOVERNANCE_FREEZE_VERSION,
  V69_QUALITY_GOVERNANCE_VERSION,
} from "../quality-governance/governance.types";

export const V69_ARCHITECTURE_COMPLIANCE_DOMAIN = "architecture-compliance" as const;

export const V69_ARCHITECTURE_COMPLIANCE_ARTIFACT_ROOT =
  "lib/technical-governance/v69/architecture-compliance" as const;

export type UpstreamQualityGovernanceLock = {
  architectureCatalog: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureCatalog;
  architectureCatalogFreeze: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureCatalogFreeze;
  architectureDependency: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureDependency;
  architectureDependencyFreeze: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureDependencyFreeze;
  codeGovernance: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.codeGovernance;
  codeGovernanceFreeze: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.codeGovernanceFreeze;
  technicalStandards: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.technicalStandards;
  technicalStandardsFreeze: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.technicalStandardsFreeze;
  securityGovernance: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.securityGovernance;
  securityGovernanceFreeze: typeof V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.securityGovernanceFreeze;
  qualityGovernance: typeof V69_QUALITY_GOVERNANCE_VERSION;
  qualityGovernanceFreeze: typeof V69_QUALITY_GOVERNANCE_FREEZE_VERSION;
};

export const V69_UPSTREAM_QUALITY_GOVERNANCE_LOCK: UpstreamQualityGovernanceLock = {
  architectureCatalog: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureCatalog,
  architectureCatalogFreeze: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureCatalogFreeze,
  architectureDependency: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureDependency,
  architectureDependencyFreeze: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.architectureDependencyFreeze,
  codeGovernance: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.codeGovernance,
  codeGovernanceFreeze: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.codeGovernanceFreeze,
  technicalStandards: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.technicalStandards,
  technicalStandardsFreeze: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.technicalStandardsFreeze,
  securityGovernance: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.securityGovernance,
  securityGovernanceFreeze: V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.securityGovernanceFreeze,
  qualityGovernance: V69_QUALITY_GOVERNANCE_VERSION,
  qualityGovernanceFreeze: V69_QUALITY_GOVERNANCE_FREEZE_VERSION,
};

export function isUpstreamQualityGovernanceLockIntact(): boolean {
  const lock = V69_UPSTREAM_QUALITY_GOVERNANCE_LOCK;
  return (
    Object.values(lock).every((v) => typeof v === "string" && v.length > 0) &&
    isUpstreamSecurityGovernanceLockIntact()
  );
}

export { V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK };
