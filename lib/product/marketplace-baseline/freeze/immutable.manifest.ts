/**
 * Product Marketplace — Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_BASELINE_ID,
  PRODUCT_MARKETPLACE_FREEZE_LOCK,
  PRODUCT_MARKETPLACE_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductMarketplaceImmutableManifest = {
  baselineId: typeof PRODUCT_MARKETPLACE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID;
  freezeVersion: typeof PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST: ProductMarketplaceImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.foundation.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.connector.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.partner.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.app.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.surface.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.integrationGovernance.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.marketplaceAudit.id,
    ];
    const payload = {
      baselineId: PRODUCT_MARKETPLACE_BASELINE_ID,
      freezeVersion: PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
      base: PRODUCT_MARKETPLACE_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_MARKETPLACE_FREEZE_LOCK.components.map((c) => c.id),
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_MARKETPLACE_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
      freezeVersion: PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductMarketplaceImmutableManifestIntact(
  manifest: ProductMarketplaceImmutableManifest = PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_MARKETPLACE_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
