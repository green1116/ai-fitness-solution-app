/**
 * Product API — Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_API_BASELINE_ID,
  PRODUCT_API_BASELINE_FREEZE_BASE,
  PRODUCT_API_BASELINE_FREEZE_VERSION,
  PRODUCT_API_BASELINE_ID,
  PRODUCT_API_COMPONENT_LOCK,
  PRODUCT_API_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductApiRollbackSnapshot = {
  snapshotId: "product-api-baseline-rollback-1";
  baselineId: typeof PRODUCT_API_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_API_BASELINE_ID;
  freezeVersion: typeof PRODUCT_API_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_API_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_API_ROLLBACK_SNAPSHOT: ProductApiRollbackSnapshot = {
  snapshotId: "product-api-baseline-rollback-1",
  baselineId: PRODUCT_API_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_API_BASELINE_ID,
  freezeVersion: PRODUCT_API_BASELINE_FREEZE_VERSION,
  restoreBase: PRODUCT_API_BASELINE_FREEZE_BASE,
  restorePhaseIds: [
    PRODUCT_API_PHASE_VERSIONS.foundation.id,
    PRODUCT_API_PHASE_VERSIONS.authentication.id,
    PRODUCT_API_PHASE_VERSIONS.gateway.id,
    PRODUCT_API_PHASE_VERSIONS.sdk.id,
    PRODUCT_API_PHASE_VERSIONS.portal.id,
    PRODUCT_API_PHASE_VERSIONS.governance.id,
    PRODUCT_API_PHASE_VERSIONS.apiAudit.id,
  ],
  restoreComponentPaths: PRODUCT_API_COMPONENT_LOCK.map((c) => c.path),
  readOnly: true,
};

export function isProductApiRollbackSnapshotIntact(
  snapshot: ProductApiRollbackSnapshot = PRODUCT_API_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-api-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_API_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_API_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
