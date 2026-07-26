/**
 * Product M10 — AI Runtime Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_COMPONENT_LOCK,
  PRODUCT_AI_RUNTIME_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductAiRuntimeRollbackSnapshot = {
  snapshotId: "product-ai-runtime-baseline-rollback-1";
  baselineId: typeof PRODUCT_AI_RUNTIME_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT: ProductAiRuntimeRollbackSnapshot =
  {
    snapshotId: "product-ai-runtime-baseline-rollback-1",
    baselineId: PRODUCT_AI_RUNTIME_BASELINE_ID,
    baselineAlias: ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
    freezeVersion: PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
    restoreBase: PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE,
    restorePhaseIds: [
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.foundation.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.jobRuntime.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.queueRuntime.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.scheduler.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.resourceManager.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.runtimeGovernance.id,
      PRODUCT_AI_RUNTIME_PHASE_VERSIONS.runtimeAudit.id,
    ],
    restoreComponentPaths: PRODUCT_AI_RUNTIME_COMPONENT_LOCK.map((c) => c.path),
    readOnly: true,
  };

export function isProductAiRuntimeRollbackSnapshotIntact(
  snapshot: ProductAiRuntimeRollbackSnapshot = PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-ai-runtime-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_AI_RUNTIME_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
