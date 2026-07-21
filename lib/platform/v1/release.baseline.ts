/**
 * Enterprise Platform v1 — Release Baseline
 * Aggregates E09/E10/E11 P8 freeze baselines + Platform v1 signoff
 */

import {
  E09_P8_GOVERNANCE_BASE,
  E09_P8_PLATFORM_FREEZE_VERSION,
  E09_P8_SIGNOFF_VERSION,
} from "../../global-network/e09/signoff/governance.freeze.lock";
import {
  E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_P8_GOVERNANCE_BASE,
  E11_P8_SIGNOFF_VERSION,
} from "../../cloud-runtime/e11/signoff/governance.freeze.lock";
import {
  E10_P8_GOVERNANCE_BASE,
  E10_P8_PLATFORM_FREEZE_VERSION,
  E10_P8_SIGNOFF_VERSION,
} from "../e10/signoff/governance.freeze.lock";
import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
  PLATFORM_V1_BASE,
  PLATFORM_V1_FREEZE_VERSION,
  PLATFORM_V1_SIGNOFF_VERSION,
} from "./platform.v1.constants";
import { isEnterpriseDependencyMapAligned } from "./dependency.map";
import type { ReleaseBaseline, ReleaseBaselineEntry } from "./platform.v1.types";

export const RELEASE_BASELINE_ENTRIES: ReleaseBaselineEntry[] = [
  {
    phase: "E09-P8",
    freezeVersion: E09_P8_PLATFORM_FREEZE_VERSION,
    signoffVersion: E09_P8_SIGNOFF_VERSION,
    completeId: E09_ENTERPRISE_COMPLETE_ID,
    governanceBase: E09_P8_GOVERNANCE_BASE,
  },
  {
    phase: "E10-P8",
    freezeVersion: E10_P8_PLATFORM_FREEZE_VERSION,
    signoffVersion: E10_P8_SIGNOFF_VERSION,
    completeId: E10_ENTERPRISE_COMPLETE_ID,
    governanceBase: E10_P8_GOVERNANCE_BASE,
  },
  {
    phase: "E11-P8",
    freezeVersion: E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
    signoffVersion: E11_P8_SIGNOFF_VERSION,
    completeId: E11_ENTERPRISE_COMPLETE_ID,
    governanceBase: E11_P8_GOVERNANCE_BASE,
  },
  {
    phase: "PLATFORM-V1",
    freezeVersion: PLATFORM_V1_FREEZE_VERSION,
    signoffVersion: PLATFORM_V1_SIGNOFF_VERSION,
    completeId: PLATFORM_V1_BASE,
    governanceBase: E11_P8_GOVERNANCE_BASE,
  },
];

export function buildReleaseBaseline(): ReleaseBaseline {
  const aligned = isEnterpriseDependencyMapAligned();
  return {
    version: PLATFORM_V1_FREEZE_VERSION,
    entries: RELEASE_BASELINE_ENTRIES.map((entry) => ({ ...entry })),
    aligned,
    summary: [
      `release-baseline version=${PLATFORM_V1_FREEZE_VERSION}`,
      `entries=${RELEASE_BASELINE_ENTRIES.length}`,
      `aligned=${aligned}`,
    ].join(" "),
  };
}

export function isReleaseBaselineAligned(): boolean {
  const baseline = buildReleaseBaseline();
  return (
    baseline.aligned &&
    baseline.entries.length === 4 &&
    baseline.entries.every(
      (entry) =>
        entry.freezeVersion.length > 0 &&
        entry.signoffVersion.length > 0 &&
        entry.completeId.length > 0,
    )
  );
}
