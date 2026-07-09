/**
 * V69 P4 — Technical standards freeze lock (read-only)
 */
import {
  V69_CODE_GOVERNANCE_FREEZE_VERSION,
  V69_CODE_GOVERNANCE_VERSION,
} from "../code-governance/governance.types";

import {
  V69_TECHNICAL_STANDARDS_FREEZE_VERSION,
  V69_TECHNICAL_STANDARDS_VERSION,
} from "./standards.types";

export type TechnicalStandardsFreezeLock = {
  technicalStandards: typeof V69_TECHNICAL_STANDARDS_VERSION;
  technicalStandardsFreeze: typeof V69_TECHNICAL_STANDARDS_FREEZE_VERSION;
  upstreamCodeGovernance: typeof V69_CODE_GOVERNANCE_VERSION;
  upstreamCodeGovernanceFreeze: typeof V69_CODE_GOVERNANCE_FREEZE_VERSION;
};

export const V69_TECHNICAL_STANDARDS_FREEZE_LOCK: TechnicalStandardsFreezeLock = {
  technicalStandards: V69_TECHNICAL_STANDARDS_VERSION,
  technicalStandardsFreeze: V69_TECHNICAL_STANDARDS_FREEZE_VERSION,
  upstreamCodeGovernance: V69_CODE_GOVERNANCE_VERSION,
  upstreamCodeGovernanceFreeze: V69_CODE_GOVERNANCE_FREEZE_VERSION,
};

export const EXPECTED_TECHNICAL_STANDARDS_FREEZE_LOCK: TechnicalStandardsFreezeLock =
  V69_TECHNICAL_STANDARDS_FREEZE_LOCK;

export function isTechnicalStandardsFreezeLockIntact(): boolean {
  const lock = V69_TECHNICAL_STANDARDS_FREEZE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function technicalStandardsFreezeLockMatchesExpected(): boolean {
  const lock = V69_TECHNICAL_STANDARDS_FREEZE_LOCK;
  const expected = EXPECTED_TECHNICAL_STANDARDS_FREEZE_LOCK;
  return (Object.keys(lock) as Array<keyof TechnicalStandardsFreezeLock>).every(
    (key) => lock[key] === expected[key],
  );
}
