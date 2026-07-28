/**
 * Product M14 — Enterprise Intelligence Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_BASELINE_ID,
  PRODUCT_INTELLIGENCE_FREEZE_LOCK,
  PRODUCT_INTELLIGENCE_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductIntelligenceImmutableManifest = {
  baselineId: typeof PRODUCT_INTELLIGENCE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST: ProductIntelligenceImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.foundation.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.catalog.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.dependency.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.policy.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.compatibility.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.governance.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.lifecycle.id,
    ];
    const payload = {
      baselineId: PRODUCT_INTELLIGENCE_BASELINE_ID,
      freezeVersion: PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_INTELLIGENCE_FREEZE_LOCK.components.map((c) => c.id),
      noNewCapability: true as const,
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_INTELLIGENCE_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
      freezeVersion: PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductIntelligenceImmutableManifestIntact(
  manifest: ProductIntelligenceImmutableManifest = PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_INTELLIGENCE_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
