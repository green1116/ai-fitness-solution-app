/**
 * Product M09 — AI Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_FREEZE_LOCK,
  PRODUCT_AI_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductAiImmutableManifest = {
  baselineId: typeof PRODUCT_AI_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AI_BASELINE_ID;
  freezeVersion: typeof PRODUCT_AI_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_AI_IMMUTABLE_MANIFEST: ProductAiImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_AI_PHASE_VERSIONS.foundation.id,
      PRODUCT_AI_PHASE_VERSIONS.model.id,
      PRODUCT_AI_PHASE_VERSIONS.promptEngine.id,
      PRODUCT_AI_PHASE_VERSIONS.workflowEngine.id,
      PRODUCT_AI_PHASE_VERSIONS.orchestration.id,
      PRODUCT_AI_PHASE_VERSIONS.governance.id,
      PRODUCT_AI_PHASE_VERSIONS.audit.id,
    ];
    const payload = {
      baselineId: PRODUCT_AI_BASELINE_ID,
      freezeVersion: PRODUCT_AI_BASELINE_FREEZE_VERSION,
      base: PRODUCT_AI_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_AI_FREEZE_LOCK.components.map((c) => c.id),
      noNewCapability: true as const,
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_AI_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_AI_BASELINE_ID,
      freezeVersion: PRODUCT_AI_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductAiImmutableManifestIntact(
  manifest: ProductAiImmutableManifest = PRODUCT_AI_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_AI_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_AI_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_AI_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
