/**
 * Product M09 — AI Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_BASELINE_FREEZE_BASE,
  PRODUCT_AI_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_COMPONENT_LOCK,
  PRODUCT_AI_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductAiRollbackSnapshot = {
  snapshotId: "product-ai-baseline-rollback-1";
  baselineId: typeof PRODUCT_AI_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AI_BASELINE_ID;
  freezeVersion: typeof PRODUCT_AI_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_AI_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_AI_ROLLBACK_SNAPSHOT: ProductAiRollbackSnapshot = {
  snapshotId: "product-ai-baseline-rollback-1",
  baselineId: PRODUCT_AI_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  freezeVersion: PRODUCT_AI_BASELINE_FREEZE_VERSION,
  restoreBase: PRODUCT_AI_BASELINE_FREEZE_BASE,
  restorePhaseIds: [
    PRODUCT_AI_PHASE_VERSIONS.foundation.id,
    PRODUCT_AI_PHASE_VERSIONS.model.id,
    PRODUCT_AI_PHASE_VERSIONS.promptEngine.id,
    PRODUCT_AI_PHASE_VERSIONS.workflowEngine.id,
    PRODUCT_AI_PHASE_VERSIONS.orchestration.id,
    PRODUCT_AI_PHASE_VERSIONS.governance.id,
    PRODUCT_AI_PHASE_VERSIONS.audit.id,
  ],
  restoreComponentPaths: PRODUCT_AI_COMPONENT_LOCK.map((c) => c.path),
  readOnly: true,
};

export function isProductAiRollbackSnapshotIntact(
  snapshot: ProductAiRollbackSnapshot = PRODUCT_AI_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-ai-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_AI_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_AI_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
