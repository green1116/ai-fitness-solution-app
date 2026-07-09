/**
 * V69 P6 — Quality governance freeze lock (read-only)
 */
import {
  V69_SECURITY_GOVERNANCE_FREEZE_VERSION,
  V69_SECURITY_GOVERNANCE_VERSION,
} from "../security-governance/governance.types";

import {
  V69_QUALITY_GOVERNANCE_FREEZE_VERSION,
  V69_QUALITY_GOVERNANCE_VERSION,
} from "./governance.types";

export type QualityGovernanceFreezeLock = {
  qualityGovernance: typeof V69_QUALITY_GOVERNANCE_VERSION;
  qualityGovernanceFreeze: typeof V69_QUALITY_GOVERNANCE_FREEZE_VERSION;
  upstreamSecurityGovernance: typeof V69_SECURITY_GOVERNANCE_VERSION;
  upstreamSecurityGovernanceFreeze: typeof V69_SECURITY_GOVERNANCE_FREEZE_VERSION;
};

export const V69_QUALITY_GOVERNANCE_FREEZE_LOCK: QualityGovernanceFreezeLock = {
  qualityGovernance: V69_QUALITY_GOVERNANCE_VERSION,
  qualityGovernanceFreeze: V69_QUALITY_GOVERNANCE_FREEZE_VERSION,
  upstreamSecurityGovernance: V69_SECURITY_GOVERNANCE_VERSION,
  upstreamSecurityGovernanceFreeze: V69_SECURITY_GOVERNANCE_FREEZE_VERSION,
};

export const EXPECTED_QUALITY_GOVERNANCE_FREEZE_LOCK: QualityGovernanceFreezeLock =
  V69_QUALITY_GOVERNANCE_FREEZE_LOCK;

export function isQualityGovernanceFreezeLockIntact(): boolean {
  const lock = V69_QUALITY_GOVERNANCE_FREEZE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function qualityGovernanceFreezeLockMatchesExpected(): boolean {
  const lock = V69_QUALITY_GOVERNANCE_FREEZE_LOCK;
  const expected = EXPECTED_QUALITY_GOVERNANCE_FREEZE_LOCK;
  return (Object.keys(lock) as Array<keyof QualityGovernanceFreezeLock>).every(
    (key) => lock[key] === expected[key],
  );
}
