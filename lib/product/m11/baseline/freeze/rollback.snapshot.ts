/**
 * Product M11 — Knowledge Platform Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_COMPONENT_LOCK,
  PRODUCT_KNOWLEDGE_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductKnowledgeRollbackSnapshot = {
  snapshotId: "product-knowledge-baseline-rollback-1";
  baselineId: typeof PRODUCT_KNOWLEDGE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT: ProductKnowledgeRollbackSnapshot =
  {
    snapshotId: "product-knowledge-baseline-rollback-1",
    baselineId: PRODUCT_KNOWLEDGE_BASELINE_ID,
    baselineAlias: ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
    freezeVersion: PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
    restoreBase: PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE,
    restorePhaseIds: [
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.foundation.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.catalog.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.dependency.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.policy.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.compatibility.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.governance.id,
      PRODUCT_KNOWLEDGE_PHASE_VERSIONS.lifecycle.id,
    ],
    restoreComponentPaths: PRODUCT_KNOWLEDGE_COMPONENT_LOCK.map((c) => c.path),
    readOnly: true,
  };

export function isProductKnowledgeRollbackSnapshotIntact(
  snapshot: ProductKnowledgeRollbackSnapshot = PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-knowledge-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_KNOWLEDGE_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
