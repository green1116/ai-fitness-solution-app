/**
 * Product M13 — Enterprise Operating System Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_BASELINE_FREEZE_VERSION,
  PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_FREEZE_LOCK,
  PRODUCT_OS_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductOsImmutableManifest = {
  baselineId: typeof PRODUCT_OS_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_OS_BASELINE_ID;
  freezeVersion: typeof PRODUCT_OS_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_OS_IMMUTABLE_MANIFEST: ProductOsImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_OS_PHASE_VERSIONS.foundation.id,
      PRODUCT_OS_PHASE_VERSIONS.catalog.id,
      PRODUCT_OS_PHASE_VERSIONS.dependency.id,
      PRODUCT_OS_PHASE_VERSIONS.policy.id,
      PRODUCT_OS_PHASE_VERSIONS.compatibility.id,
      PRODUCT_OS_PHASE_VERSIONS.governance.id,
      PRODUCT_OS_PHASE_VERSIONS.lifecycle.id,
    ];
    const payload = {
      baselineId: PRODUCT_OS_BASELINE_ID,
      freezeVersion: PRODUCT_OS_BASELINE_FREEZE_VERSION,
      base: PRODUCT_OS_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_OS_FREEZE_LOCK.components.map((c) => c.id),
      noNewCapability: true as const,
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_OS_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_OS_BASELINE_ID,
      freezeVersion: PRODUCT_OS_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductOsImmutableManifestIntact(
  manifest: ProductOsImmutableManifest = PRODUCT_OS_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_OS_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_OS_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_OS_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
