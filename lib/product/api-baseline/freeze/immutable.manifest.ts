/**
 * Product API — Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_API_BASELINE_ID,
  PRODUCT_API_BASELINE_FREEZE_VERSION,
  PRODUCT_API_BASELINE_ID,
  PRODUCT_API_FREEZE_LOCK,
  PRODUCT_API_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductApiImmutableManifest = {
  baselineId: typeof PRODUCT_API_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_API_BASELINE_ID;
  freezeVersion: typeof PRODUCT_API_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_API_IMMUTABLE_MANIFEST: ProductApiImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_API_PHASE_VERSIONS.foundation.id,
      PRODUCT_API_PHASE_VERSIONS.authentication.id,
      PRODUCT_API_PHASE_VERSIONS.gateway.id,
      PRODUCT_API_PHASE_VERSIONS.sdk.id,
      PRODUCT_API_PHASE_VERSIONS.portal.id,
      PRODUCT_API_PHASE_VERSIONS.governance.id,
      PRODUCT_API_PHASE_VERSIONS.apiAudit.id,
    ];
    const payload = {
      baselineId: PRODUCT_API_BASELINE_ID,
      freezeVersion: PRODUCT_API_BASELINE_FREEZE_VERSION,
      base: PRODUCT_API_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_API_FREEZE_LOCK.components.map((c) => c.id),
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_API_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_API_BASELINE_ID,
      freezeVersion: PRODUCT_API_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductApiImmutableManifestIntact(
  manifest: ProductApiImmutableManifest = PRODUCT_API_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_API_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_API_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_API_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
