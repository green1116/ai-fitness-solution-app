/**
 * Product M11 — Knowledge Platform Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_FREEZE_LOCK,
  PRODUCT_KNOWLEDGE_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductKnowledgeImmutableManifest = {
  baselineId: typeof PRODUCT_KNOWLEDGE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST: ProductKnowledgeImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.foundation.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.catalog.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.dependency.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.policy.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.compatibility.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.governance.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.lifecycle.id,
    ];
    const payload = {
      baselineId: PRODUCT_KNOWLEDGE_BASELINE_ID,
      freezeVersion: PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
      base: PRODUCT_KNOWLEDGE_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_KNOWLEDGE_FREEZE_LOCK.components.map((c) => c.id),
      noNewCapability: true as const,
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_KNOWLEDGE_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
      freezeVersion: PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductKnowledgeImmutableManifestIntact(
  manifest: ProductKnowledgeImmutableManifest = PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_KNOWLEDGE_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
