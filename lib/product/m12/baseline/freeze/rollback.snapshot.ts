/**
 * Product M12 — AI Agent Platform Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_BASELINE_FREEZE_BASE,
  PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
  PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_COMPONENT_LOCK,
  PRODUCT_AGENT_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductAgentRollbackSnapshot = {
  snapshotId: "product-agent-baseline-rollback-1";
  baselineId: typeof PRODUCT_AGENT_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AGENT_BASELINE_ID;
  freezeVersion: typeof PRODUCT_AGENT_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_AGENT_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_AGENT_ROLLBACK_SNAPSHOT: ProductAgentRollbackSnapshot = {
  snapshotId: "product-agent-baseline-rollback-1",
  baselineId: PRODUCT_AGENT_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  freezeVersion: PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
  restoreBase: PRODUCT_AGENT_BASELINE_FREEZE_BASE,
  restorePhaseIds: [
    PRODUCT_AGENT_PHASE_VERSIONS.foundation.id,
    PRODUCT_AGENT_PHASE_VERSIONS.catalog.id,
    PRODUCT_AGENT_PHASE_VERSIONS.dependency.id,
    PRODUCT_AGENT_PHASE_VERSIONS.policy.id,
    PRODUCT_AGENT_PHASE_VERSIONS.compatibility.id,
    PRODUCT_AGENT_PHASE_VERSIONS.governance.id,
    PRODUCT_AGENT_PHASE_VERSIONS.lifecycle.id,
  ],
  restoreComponentPaths: PRODUCT_AGENT_COMPONENT_LOCK.map((c) => c.path),
  readOnly: true,
};

export function isProductAgentRollbackSnapshotIntact(
  snapshot: ProductAgentRollbackSnapshot = PRODUCT_AGENT_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-agent-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_AGENT_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_AGENT_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
