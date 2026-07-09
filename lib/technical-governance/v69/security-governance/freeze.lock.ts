/**
 * V69 P5 — Security governance freeze lock (read-only)
 */
import {
  V69_TECHNICAL_STANDARDS_FREEZE_VERSION,
  V69_TECHNICAL_STANDARDS_VERSION,
} from "../technical-standards/standards.types";

import {
  V69_SECURITY_GOVERNANCE_FREEZE_VERSION,
  V69_SECURITY_GOVERNANCE_VERSION,
} from "./governance.types";

export type SecurityGovernanceFreezeLock = {
  securityGovernance: typeof V69_SECURITY_GOVERNANCE_VERSION;
  securityGovernanceFreeze: typeof V69_SECURITY_GOVERNANCE_FREEZE_VERSION;
  upstreamTechnicalStandards: typeof V69_TECHNICAL_STANDARDS_VERSION;
  upstreamTechnicalStandardsFreeze: typeof V69_TECHNICAL_STANDARDS_FREEZE_VERSION;
};

export const V69_SECURITY_GOVERNANCE_FREEZE_LOCK: SecurityGovernanceFreezeLock = {
  securityGovernance: V69_SECURITY_GOVERNANCE_VERSION,
  securityGovernanceFreeze: V69_SECURITY_GOVERNANCE_FREEZE_VERSION,
  upstreamTechnicalStandards: V69_TECHNICAL_STANDARDS_VERSION,
  upstreamTechnicalStandardsFreeze: V69_TECHNICAL_STANDARDS_FREEZE_VERSION,
};

export const EXPECTED_SECURITY_GOVERNANCE_FREEZE_LOCK: SecurityGovernanceFreezeLock =
  V69_SECURITY_GOVERNANCE_FREEZE_LOCK;

export function isSecurityGovernanceFreezeLockIntact(): boolean {
  const lock = V69_SECURITY_GOVERNANCE_FREEZE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function securityGovernanceFreezeLockMatchesExpected(): boolean {
  const lock = V69_SECURITY_GOVERNANCE_FREEZE_LOCK;
  const expected = EXPECTED_SECURITY_GOVERNANCE_FREEZE_LOCK;
  return (Object.keys(lock) as Array<keyof SecurityGovernanceFreezeLock>).every(
    (key) => lock[key] === expected[key],
  );
}
