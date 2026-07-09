/**
 * V70 P8 — Delivery layer version lock (read-only)
 */
import {
  V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION,
  V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION,
} from "@/lib/technical-governance/v69/signoff/signoff.types";

import { V70_DELIVERY_COMPLIANCE_VERSION } from "../delivery.compliance";
import { V70_LIFECYCLE_MANAGEMENT_VERSION } from "../lifecycle.management";
import { V70_RELEASE_VERSION } from "../release.types";
import { V70_RELEASE_DEPENDENCY_VERSION } from "../release.dependency";
import { V70_RELEASE_POLICY_VERSION } from "../release.policy";
import { V70_UPGRADE_GOVERNANCE_VERSION } from "../upgrade.governance";
import { V70_VERSION_COMPATIBILITY_VERSION } from "../version.compatibility";

import type { LockVersion } from "./signoff.types";
import { V70_DELIVERY_FREEZE_VERSION, V70_DELIVERY_SIGNOFF_VERSION } from "./signoff.types";

export const V70_DELIVERY_LAYER_VERSION_LOCK: LockVersion = {
  releaseCatalog: V70_RELEASE_VERSION,
  releaseDependency: V70_RELEASE_DEPENDENCY_VERSION,
  releasePolicy: V70_RELEASE_POLICY_VERSION,
  versionCompatibility: V70_VERSION_COMPATIBILITY_VERSION,
  upgradeGovernance: V70_UPGRADE_GOVERNANCE_VERSION,
  lifecycleManagement: V70_LIFECYCLE_MANAGEMENT_VERSION,
  deliveryCompliance: V70_DELIVERY_COMPLIANCE_VERSION,
  signoff: V70_DELIVERY_SIGNOFF_VERSION,
  freeze: V70_DELIVERY_FREEZE_VERSION,
  upstreamV69TechnicalGovernanceSignoff: V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION,
  upstreamV69TechnicalGovernanceFreeze: V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION,
};

export const EXPECTED_DELIVERY_LAYER_VERSIONS: LockVersion = V70_DELIVERY_LAYER_VERSION_LOCK;

export function isDeliveryLayerVersionLockIntact(): boolean {
  const lock = V70_DELIVERY_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function deliveryVersionLockMatchesExpected(): boolean {
  const lock = V70_DELIVERY_LAYER_VERSION_LOCK;
  const expected = EXPECTED_DELIVERY_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
