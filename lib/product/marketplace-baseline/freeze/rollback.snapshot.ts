/**
 * Product Marketplace — Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_BASELINE_ID,
  PRODUCT_MARKETPLACE_COMPONENT_LOCK,
  PRODUCT_MARKETPLACE_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductMarketplaceRollbackSnapshot = {
  snapshotId: "product-marketplace-baseline-rollback-1";
  baselineId: typeof PRODUCT_MARKETPLACE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID;
  freezeVersion: typeof PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_MARKETPLACE_ROLLBACK_SNAPSHOT: ProductMarketplaceRollbackSnapshot =
  {
    snapshotId: "product-marketplace-baseline-rollback-1",
    baselineId: PRODUCT_MARKETPLACE_BASELINE_ID,
    baselineAlias: ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
    freezeVersion: PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
    restoreBase: PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE,
    restorePhaseIds: [
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.foundation.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.connector.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.partner.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.app.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.surface.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.integrationGovernance.id,
      PRODUCT_MARKETPLACE_PHASE_VERSIONS.marketplaceAudit.id,
    ],
    restoreComponentPaths: PRODUCT_MARKETPLACE_COMPONENT_LOCK.map(
      (c) => c.path,
    ),
    readOnly: true,
  };

export function isProductMarketplaceRollbackSnapshotIntact(
  snapshot: ProductMarketplaceRollbackSnapshot = PRODUCT_MARKETPLACE_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-marketplace-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_MARKETPLACE_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
