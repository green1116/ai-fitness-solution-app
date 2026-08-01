/**
 * AE-6 — Application freeze manifest.
 * Manifest of locked AE-1…AE-5 packages — freeze-only inventory.
 */
import {
  AE6_APPLICATION_BASELINE_ID,
  AE6_APPLICATION_COMPLETE_ID,
  AE6_BASELINE_CATALOGUE,
  AE6_TAG_REF,
} from "./freeze.baseline";
import { AE6_FREEZE_ID, AE6_BASE_FREEZE_REF } from "./freeze.definition";
import { AE6_FREEZE_LOCKS } from "./freeze.lock";
import { AE6_ROLLBACK_CATALOGUE } from "./freeze.rollback";

export const AE6_PACKAGE_CHAIN = [
  "AE-1",
  "AE-2",
  "AE-3",
  "AE-4",
  "AE-5",
  "AE-6",
] as const;

export type Ae6ManifestPackage = Readonly<{
  packageId: (typeof AE6_PACKAGE_CHAIN)[number];
  layerId: string;
  modulePath: string;
  evidenceScript: string;
}>;

export const AE6_MANIFEST_PACKAGES = [
  {
    packageId: "AE-1",
    layerId: "application-assembly-ae1-v1",
    modulePath: "lib/application/ae1",
    evidenceScript: "scripts/verify-application-ae1.ts",
  },
  {
    packageId: "AE-2",
    layerId: "application-runtime-ae2-v1",
    modulePath: "lib/application/ae2",
    evidenceScript: "scripts/verify-application-ae2.ts",
  },
  {
    packageId: "AE-3",
    layerId: "application-workflow-ae3-v1",
    modulePath: "lib/application/ae3",
    evidenceScript: "scripts/verify-application-ae3.ts",
  },
  {
    packageId: "AE-4",
    layerId: "application-integration-ae4-v1",
    modulePath: "lib/application/ae4",
    evidenceScript: "scripts/verify-application-ae4.ts",
  },
  {
    packageId: "AE-5",
    layerId: "application-verification-ae5-v1",
    modulePath: "lib/application/ae5",
    evidenceScript: "scripts/verify-application-ae5.ts",
  },
  {
    packageId: "AE-6",
    layerId: AE6_FREEZE_ID,
    modulePath: "lib/application/ae6",
    evidenceScript: "scripts/verify-application-ae6.ts",
  },
] as const satisfies readonly Ae6ManifestPackage[];

export type ApplicationFreezeManifest = Readonly<{
  freezeId: typeof AE6_FREEZE_ID;
  baseFreezeRef: typeof AE6_BASE_FREEZE_REF;
  baselineId: typeof AE6_APPLICATION_BASELINE_ID;
  completeId: typeof AE6_APPLICATION_COMPLETE_ID;
  tagRef: typeof AE6_TAG_REF;
  chain: string;
  packages: typeof AE6_MANIFEST_PACKAGES;
  locks: typeof AE6_FREEZE_LOCKS;
  rollbacks: typeof AE6_ROLLBACK_CATALOGUE;
  baselines: typeof AE6_BASELINE_CATALOGUE;
}>;

/**
 * Build immutable freeze manifest for AE-1…AE-6.
 */
export function resolveApplicationFreezeManifest(): ApplicationFreezeManifest {
  return {
    freezeId: AE6_FREEZE_ID,
    baseFreezeRef: AE6_BASE_FREEZE_REF,
    baselineId: AE6_APPLICATION_BASELINE_ID,
    completeId: AE6_APPLICATION_COMPLETE_ID,
    tagRef: AE6_TAG_REF,
    chain: AE6_PACKAGE_CHAIN.join("→"),
    packages: AE6_MANIFEST_PACKAGES,
    locks: AE6_FREEZE_LOCKS,
    rollbacks: AE6_ROLLBACK_CATALOGUE,
    baselines: AE6_BASELINE_CATALOGUE,
  };
}
