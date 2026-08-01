/**
 * PL-8 — Post Launch freeze manifest.
 * Manifest of locked PL-2.1…PL-7 packages — freeze-only inventory.
 */

import {
  POST_LAUNCH_BASE_FREEZE_REF,
  POST_LAUNCH_BASELINE_ID,
  POST_LAUNCH_COMPLETE_ID,
  POST_LAUNCH_FREEZE_DEFINITION,
  POST_LAUNCH_FREEZE_ID,
  POST_LAUNCH_LAYER_IDS,
  POST_LAUNCH_MODULE_PATHS,
  POST_LAUNCH_PACKAGE_CHAIN,
  POST_LAUNCH_PRIOR_PACKAGE_CHAIN,
  POST_LAUNCH_TAG_REF,
  type PostLaunchPackageId,
} from "./freeze.constants";
import {
  POST_LAUNCH_FREEZE_LOCKS,
  isPostLaunchFreezeLockIntact,
} from "./freeze.lock";

export type PostLaunchManifestPackage = Readonly<{
  packageId: PostLaunchPackageId;
  layerId: string;
  modulePath: string;
  evidenceFiles: readonly string[];
}>;

export const POST_LAUNCH_MANIFEST_PACKAGES = [
  {
    packageId: "PL-2.1",
    layerId: POST_LAUNCH_LAYER_IDS["PL-2.1"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-2.1"],
    evidenceFiles: [
      "lib/post-launch/p2/service-monitoring/service-monitoring.types.ts",
      "lib/post-launch/p2/service-monitoring/service-monitoring.manager.ts",
    ],
  },
  {
    packageId: "PL-3",
    layerId: POST_LAUNCH_LAYER_IDS["PL-3"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-3"],
    evidenceFiles: [
      "lib/post-launch/p3/incident-management/incident-management.types.ts",
      "lib/post-launch/p3/incident-management/incident-management.manager.ts",
    ],
  },
  {
    packageId: "PL-4",
    layerId: POST_LAUNCH_LAYER_IDS["PL-4"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-4"],
    evidenceFiles: [
      "lib/post-launch/p4/release-operations/release-operations.types.ts",
      "lib/post-launch/p4/release-operations/release-operations.manager.ts",
    ],
  },
  {
    packageId: "PL-5",
    layerId: POST_LAUNCH_LAYER_IDS["PL-5"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-5"],
    evidenceFiles: [
      "lib/post-launch/p5/maintenance/maintenance.types.ts",
      "lib/post-launch/p5/maintenance/maintenance.manager.ts",
    ],
  },
  {
    packageId: "PL-6",
    layerId: POST_LAUNCH_LAYER_IDS["PL-6"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-6"],
    evidenceFiles: [
      "lib/post-launch/p6/customer-support/customer-support.types.ts",
      "lib/post-launch/p6/customer-support/customer-support.manager.ts",
    ],
  },
  {
    packageId: "PL-7",
    layerId: POST_LAUNCH_LAYER_IDS["PL-7"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-7"],
    evidenceFiles: [
      "lib/post-launch/p7/continuous-improvement/continuous-improvement.types.ts",
      "lib/post-launch/p7/continuous-improvement/continuous-improvement.manager.ts",
    ],
  },
  {
    packageId: "PL-8",
    layerId: POST_LAUNCH_LAYER_IDS["PL-8"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-8"],
    evidenceFiles: [
      "lib/post-launch/p8/baseline/freeze.constants.ts",
      "lib/post-launch/p8/baseline/freeze.manifest.ts",
      "lib/post-launch/p8/baseline/freeze.lock.ts",
      "lib/post-launch/p8/baseline/baseline.manager.ts",
      "lib/post-launch/p8/baseline/verify/post-launch.baseline.gate.ts",
      "scripts/verify-post-launch-p8.ts",
    ],
  },
] as const satisfies readonly PostLaunchManifestPackage[];

export type PostLaunchFreezeManifest = Readonly<{
  freezeId: typeof POST_LAUNCH_FREEZE_ID;
  baseFreezeRef: typeof POST_LAUNCH_BASE_FREEZE_REF;
  baselineId: typeof POST_LAUNCH_BASELINE_ID;
  completeId: typeof POST_LAUNCH_COMPLETE_ID;
  tagRef: typeof POST_LAUNCH_TAG_REF;
  chain: string;
  priorChain: string;
  packages: typeof POST_LAUNCH_MANIFEST_PACKAGES;
  locks: typeof POST_LAUNCH_FREEZE_LOCKS;
  definition: typeof POST_LAUNCH_FREEZE_DEFINITION;
  freezeOnly: true;
  readOnly: true;
}>;

/**
 * Build immutable freeze manifest for PL-2.1…PL-8.
 */
export function resolvePostLaunchFreezeManifest(): PostLaunchFreezeManifest {
  return {
    freezeId: POST_LAUNCH_FREEZE_ID,
    baseFreezeRef: POST_LAUNCH_BASE_FREEZE_REF,
    baselineId: POST_LAUNCH_BASELINE_ID,
    completeId: POST_LAUNCH_COMPLETE_ID,
    tagRef: POST_LAUNCH_TAG_REF,
    chain: POST_LAUNCH_PACKAGE_CHAIN.join("→"),
    priorChain: POST_LAUNCH_PRIOR_PACKAGE_CHAIN.join("→"),
    packages: POST_LAUNCH_MANIFEST_PACKAGES,
    locks: POST_LAUNCH_FREEZE_LOCKS,
    definition: POST_LAUNCH_FREEZE_DEFINITION,
    freezeOnly: true,
    readOnly: true,
  };
}

export function isPostLaunchFreezeManifestIntact(
  manifest: PostLaunchFreezeManifest = resolvePostLaunchFreezeManifest(),
): boolean {
  return (
    manifest.freezeOnly === true &&
    manifest.readOnly === true &&
    manifest.freezeId === POST_LAUNCH_FREEZE_ID &&
    manifest.baselineId === POST_LAUNCH_BASELINE_ID &&
    manifest.completeId === POST_LAUNCH_COMPLETE_ID &&
    manifest.packages.length === POST_LAUNCH_PACKAGE_CHAIN.length &&
    manifest.packages.length === 7 &&
    isPostLaunchFreezeLockIntact(manifest.locks) &&
    manifest.chain === "PL-2.1→PL-3→PL-4→PL-5→PL-6→PL-7→PL-8" &&
    manifest.priorChain === "PL-2.1→PL-3→PL-4→PL-5→PL-6→PL-7"
  );
}
