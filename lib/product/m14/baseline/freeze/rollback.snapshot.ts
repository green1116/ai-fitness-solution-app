/**
 * Product M14 — Enterprise Intelligence Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_BASELINE_ID,
  PRODUCT_INTELLIGENCE_COMPONENT_LOCK,
  PRODUCT_INTELLIGENCE_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductIntelligenceRollbackSnapshot = {
  snapshotId: "product-intelligence-baseline-rollback-1";
  baselineId: typeof PRODUCT_INTELLIGENCE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_INTELLIGENCE_ROLLBACK_SNAPSHOT: ProductIntelligenceRollbackSnapshot =
  {
    snapshotId: "product-intelligence-baseline-rollback-1",
    baselineId: PRODUCT_INTELLIGENCE_BASELINE_ID,
    baselineAlias: ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
    freezeVersion: PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
    restoreBase: PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE,
    restorePhaseIds: [
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.foundation.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.catalog.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.dependency.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.policy.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.compatibility.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.governance.id,
      PRODUCT_INTELLIGENCE_PHASE_VERSIONS.lifecycle.id,
    ],
    restoreComponentPaths: PRODUCT_INTELLIGENCE_COMPONENT_LOCK.map(
      (c) => c.path,
    ),
    readOnly: true,
  };

export function isProductIntelligenceRollbackSnapshotIntact(
  snapshot: ProductIntelligenceRollbackSnapshot = PRODUCT_INTELLIGENCE_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-intelligence-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_INTELLIGENCE_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
