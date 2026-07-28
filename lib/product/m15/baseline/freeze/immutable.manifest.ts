/**
 * Product M15 — Enterprise Evolution Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_FREEZE_LOCK,
  PRODUCT_EVOLUTION_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductEvolutionImmutableManifest = {
  baselineId: typeof PRODUCT_EVOLUTION_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID;
  freezeVersion: typeof PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST: ProductEvolutionImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_EVOLUTION_PHASE_VERSIONS.foundation.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.feedback.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.experience.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.learning.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.optimization.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.capability.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.governance.id,
    ];
    const payload = {
      baselineId: PRODUCT_EVOLUTION_BASELINE_ID,
      freezeVersion: PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
      base: PRODUCT_EVOLUTION_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_EVOLUTION_FREEZE_LOCK.components.map((c) => c.id),
      noNewCapability: true as const,
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_EVOLUTION_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
      freezeVersion: PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductEvolutionImmutableManifestIntact(
  manifest: ProductEvolutionImmutableManifest = PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_EVOLUTION_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
