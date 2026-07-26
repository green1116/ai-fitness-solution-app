/**
 * Product M10 — AI Runtime Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_FREEZE_LOCK,
  PRODUCT_AI_RUNTIME_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductAiRuntimeImmutableManifest = {
  baselineId: typeof PRODUCT_AI_RUNTIME_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST: ProductAiRuntimeImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.foundation.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.jobRuntime.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.queueRuntime.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.scheduler.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.resourceManager.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.runtimeGovernance.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.runtimeAudit.id,
    ];
    const payload = {
      baselineId: PRODUCT_AI_RUNTIME_BASELINE_ID,
      freezeVersion: PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
      base: PRODUCT_AI_RUNTIME_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_AI_RUNTIME_FREEZE_LOCK.components.map((c) => c.id),
      noNewCapability: true as const,
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_AI_RUNTIME_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
      freezeVersion: PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductAiRuntimeImmutableManifestIntact(
  manifest: ProductAiRuntimeImmutableManifest = PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_AI_RUNTIME_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
