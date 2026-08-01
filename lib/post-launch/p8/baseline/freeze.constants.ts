/**
 * PL-8 — Post Launch Baseline Freeze constants.
 * Freeze catalogue only — no new capability.
 */

import { CONTINUOUS_IMPROVEMENT_ID } from "../../p7/continuous-improvement/continuous-improvement.types";
import { CUSTOMER_SUPPORT_ID } from "../../p6/customer-support/customer-support.types";
import { INCIDENT_MANAGEMENT_ID } from "../../p3/incident-management/incident-management.types";
import { MAINTENANCE_ID } from "../../p5/maintenance/maintenance.types";
import { RELEASE_OPERATIONS_ID } from "../../p4/release-operations/release-operations.types";
import { SERVICE_MONITORING_ID } from "../../p2/service-monitoring/service-monitoring.types";

export const POST_LAUNCH_FREEZE_ID = "pl-8-post-launch-baseline-v1" as const;

export const POST_LAUNCH_FREEZE_GATE = "pl-8-post-launch-baseline-gate" as const;

export const POST_LAUNCH_PACKAGE_ID = "PL-8" as const;

export const POST_LAUNCH_BASELINE_ID = "post-launch-baseline-v1" as const;

export const POST_LAUNCH_COMPLETE_ID = "post-launch-complete-v1" as const;

/** Tag reference only — freeze does not create git tags. */
export const POST_LAUNCH_TAG_REF = "pl-8-post-launch-baseline-v1" as const;

/** Frozen base — last prior package (PL-7). */
export const POST_LAUNCH_BASE_FREEZE_REF = CONTINUOUS_IMPROVEMENT_ID;

export const POST_LAUNCH_MODULE_PATH = "lib/post-launch/p8/baseline" as const;

/**
 * Prior package chain delivered under lib/post-launch.
 * Series starts at PL-2.1 (no separate PL-1 module in this tree).
 */
export const POST_LAUNCH_PRIOR_PACKAGE_CHAIN = [
  "PL-2.1",
  "PL-3",
  "PL-4",
  "PL-5",
  "PL-6",
  "PL-7",
] as const;

export const POST_LAUNCH_PACKAGE_CHAIN = [
  ...POST_LAUNCH_PRIOR_PACKAGE_CHAIN,
  "PL-8",
] as const;

export type PostLaunchPackageId =
  (typeof POST_LAUNCH_PACKAGE_CHAIN)[number];

export const POST_LAUNCH_LAYER_IDS = {
  "PL-2.1": SERVICE_MONITORING_ID,
  "PL-3": INCIDENT_MANAGEMENT_ID,
  "PL-4": RELEASE_OPERATIONS_ID,
  "PL-5": MAINTENANCE_ID,
  "PL-6": CUSTOMER_SUPPORT_ID,
  "PL-7": CONTINUOUS_IMPROVEMENT_ID,
  "PL-8": POST_LAUNCH_FREEZE_ID,
} as const satisfies Record<PostLaunchPackageId, string>;

export const POST_LAUNCH_MODULE_PATHS = {
  "PL-2.1": "lib/post-launch/p2/service-monitoring",
  "PL-3": "lib/post-launch/p3/incident-management",
  "PL-4": "lib/post-launch/p4/release-operations",
  "PL-5": "lib/post-launch/p5/maintenance",
  "PL-6": "lib/post-launch/p6/customer-support",
  "PL-7": "lib/post-launch/p7/continuous-improvement",
  "PL-8": POST_LAUNCH_MODULE_PATH,
} as const satisfies Record<PostLaunchPackageId, string>;

export const POST_LAUNCH_PURPOSE =
  "Lock PL-2.1…PL-7 post-launch stack as a freeze / baseline catalogue" as const;

export const POST_LAUNCH_NON_GOALS = [
  "new-capability",
  "incident-workflow",
  "support-workflow",
  "release-workflow",
  "maintenance-workflow",
  "monitoring-provider",
  "io",
  "persistence",
  "timers",
  "external-provider",
  "upstream-redesign",
] as const;

export type PostLaunchNonGoal = (typeof POST_LAUNCH_NON_GOALS)[number];

export type PostLaunchFreezeDefinition = Readonly<{
  freezeId: typeof POST_LAUNCH_FREEZE_ID;
  packageId: typeof POST_LAUNCH_PACKAGE_ID;
  gateId: typeof POST_LAUNCH_FREEZE_GATE;
  baselineId: typeof POST_LAUNCH_BASELINE_ID;
  completeId: typeof POST_LAUNCH_COMPLETE_ID;
  tagRef: typeof POST_LAUNCH_TAG_REF;
  baseFreezeRef: typeof POST_LAUNCH_BASE_FREEZE_REF;
  purpose: typeof POST_LAUNCH_PURPOSE;
  nonGoals: readonly PostLaunchNonGoal[];
  modulePath: typeof POST_LAUNCH_MODULE_PATH;
  freezeOnly: true;
}>;

export const POST_LAUNCH_FREEZE_DEFINITION = {
  freezeId: POST_LAUNCH_FREEZE_ID,
  packageId: POST_LAUNCH_PACKAGE_ID,
  gateId: POST_LAUNCH_FREEZE_GATE,
  baselineId: POST_LAUNCH_BASELINE_ID,
  completeId: POST_LAUNCH_COMPLETE_ID,
  tagRef: POST_LAUNCH_TAG_REF,
  baseFreezeRef: POST_LAUNCH_BASE_FREEZE_REF,
  purpose: POST_LAUNCH_PURPOSE,
  nonGoals: POST_LAUNCH_NON_GOALS,
  modulePath: POST_LAUNCH_MODULE_PATH,
  freezeOnly: true,
} as const satisfies PostLaunchFreezeDefinition;
