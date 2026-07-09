/**
 * V69 P7 — Architecture compliance freeze lock (read-only)
 */
import {
  V69_QUALITY_GOVERNANCE_FREEZE_VERSION,
  V69_QUALITY_GOVERNANCE_VERSION,
} from "../quality-governance/governance.types";

import {
  V69_ARCHITECTURE_COMPLIANCE_FREEZE_VERSION,
  V69_ARCHITECTURE_COMPLIANCE_VERSION,
} from "./compliance.types";

export type ArchitectureComplianceFreezeLock = {
  architectureCompliance: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  architectureComplianceFreeze: typeof V69_ARCHITECTURE_COMPLIANCE_FREEZE_VERSION;
  upstreamQualityGovernance: typeof V69_QUALITY_GOVERNANCE_VERSION;
  upstreamQualityGovernanceFreeze: typeof V69_QUALITY_GOVERNANCE_FREEZE_VERSION;
};

export const V69_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK: ArchitectureComplianceFreezeLock = {
  architectureCompliance: V69_ARCHITECTURE_COMPLIANCE_VERSION,
  architectureComplianceFreeze: V69_ARCHITECTURE_COMPLIANCE_FREEZE_VERSION,
  upstreamQualityGovernance: V69_QUALITY_GOVERNANCE_VERSION,
  upstreamQualityGovernanceFreeze: V69_QUALITY_GOVERNANCE_FREEZE_VERSION,
};

export const EXPECTED_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK: ArchitectureComplianceFreezeLock =
  V69_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK;

export function isArchitectureComplianceFreezeLockIntact(): boolean {
  const lock = V69_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function architectureComplianceFreezeLockMatchesExpected(): boolean {
  const lock = V69_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK;
  const expected = EXPECTED_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK;
  return (Object.keys(lock) as Array<keyof ArchitectureComplianceFreezeLock>).every(
    (key) => lock[key] === expected[key],
  );
}
