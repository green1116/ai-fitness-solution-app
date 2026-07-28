/**
 * Product M15 — Enterprise Evolution Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_COMPONENT_LOCK,
  PRODUCT_EVOLUTION_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductEvolutionRollbackSnapshot = {
  snapshotId: "product-evolution-baseline-rollback-1";
  baselineId: typeof PRODUCT_EVOLUTION_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID;
  freezeVersion: typeof PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT: ProductEvolutionRollbackSnapshot =
  {
    snapshotId: "product-evolution-baseline-rollback-1",
    baselineId: PRODUCT_EVOLUTION_BASELINE_ID,
    baselineAlias: ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
    freezeVersion: PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
    restoreBase: PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE,
    restorePhaseIds: [
      PRODUCT_EVOLUTION_PHASE_VERSIONS.foundation.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.feedback.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.experience.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.learning.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.optimization.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.capability.id,
      PRODUCT_EVOLUTION_PHASE_VERSIONS.governance.id,
    ],
    restoreComponentPaths: PRODUCT_EVOLUTION_COMPONENT_LOCK.map((c) => c.path),
    readOnly: true,
  };

export function isProductEvolutionRollbackSnapshotIntact(
  snapshot: ProductEvolutionRollbackSnapshot = PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-evolution-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_EVOLUTION_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
