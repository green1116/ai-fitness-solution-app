/**
 * Product M12 — AI Agent Platform Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
  PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_FREEZE_LOCK,
  PRODUCT_AGENT_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductAgentImmutableManifest = {
  baselineId: typeof PRODUCT_AGENT_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AGENT_BASELINE_ID;
  freezeVersion: typeof PRODUCT_AGENT_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_AGENT_IMMUTABLE_MANIFEST: ProductAgentImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_AGENT_PHASE_VERSIONS.foundation.id,
      PRODUCT_AGENT_PHASE_VERSIONS.catalog.id,
      PRODUCT_AGENT_PHASE_VERSIONS.dependency.id,
      PRODUCT_AGENT_PHASE_VERSIONS.policy.id,
      PRODUCT_AGENT_PHASE_VERSIONS.compatibility.id,
      PRODUCT_AGENT_PHASE_VERSIONS.governance.id,
      PRODUCT_AGENT_PHASE_VERSIONS.lifecycle.id,
    ];
    const payload = {
      baselineId: PRODUCT_AGENT_BASELINE_ID,
      freezeVersion: PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
      base: PRODUCT_AGENT_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_AGENT_FREEZE_LOCK.components.map((c) => c.id),
      noNewCapability: true as const,
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_AGENT_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
      freezeVersion: PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductAgentImmutableManifestIntact(
  manifest: ProductAgentImmutableManifest = PRODUCT_AGENT_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_AGENT_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_AGENT_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_AGENT_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
