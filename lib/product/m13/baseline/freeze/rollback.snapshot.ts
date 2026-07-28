/**
 * Product M13 — Enterprise Operating System Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_BASELINE_FREEZE_BASE,
  PRODUCT_OS_BASELINE_FREEZE_VERSION,
  PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_COMPONENT_LOCK,
  PRODUCT_OS_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductOsRollbackSnapshot = {
  snapshotId: "product-os-baseline-rollback-1";
  baselineId: typeof PRODUCT_OS_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_OS_BASELINE_ID;
  freezeVersion: typeof PRODUCT_OS_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_OS_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_OS_ROLLBACK_SNAPSHOT: ProductOsRollbackSnapshot = {
  snapshotId: "product-os-baseline-rollback-1",
  baselineId: PRODUCT_OS_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  freezeVersion: PRODUCT_OS_BASELINE_FREEZE_VERSION,
  restoreBase: PRODUCT_OS_BASELINE_FREEZE_BASE,
  restorePhaseIds: [
    PRODUCT_OS_PHASE_VERSIONS.foundation.id,
    PRODUCT_OS_PHASE_VERSIONS.catalog.id,
    PRODUCT_OS_PHASE_VERSIONS.dependency.id,
    PRODUCT_OS_PHASE_VERSIONS.policy.id,
    PRODUCT_OS_PHASE_VERSIONS.compatibility.id,
    PRODUCT_OS_PHASE_VERSIONS.governance.id,
    PRODUCT_OS_PHASE_VERSIONS.lifecycle.id,
  ],
  restoreComponentPaths: PRODUCT_OS_COMPONENT_LOCK.map((c) => c.path),
  readOnly: true,
};

export function isProductOsRollbackSnapshotIntact(
  snapshot: ProductOsRollbackSnapshot = PRODUCT_OS_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-os-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_OS_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_OS_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
