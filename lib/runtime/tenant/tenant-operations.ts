/**
 * RSO-5 — Tenant Operations Runtime
 * Deterministic tenant operations projection from RSO-4 RecoveryWorkflow.
 * Baseline: rso4-recovery-workflow-v1 (traces post-ga-production-baseline-v1).
 * No prisma / billing / license / Project·Quote·Tender / redesign.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../../release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
} from "../../release/health/release-health-registry";
import { RELEASE_ID } from "../../release/release-readiness";
import {
  RECOVERY_WORKFLOW_VERSION,
  RSO3_INCIDENT_MANAGEMENT_BASELINE,
  RSO_4_ID,
  buildRecoveryWorkflow,
  getRecoveryWorkflow,
  type RecoveryAction,
  type RecoveryWorkflow,
  type RecoveryWorkflowStatus,
} from "../recovery";
import {
  aggregateTenantOperationsSurfaceStatus,
  tenantOperationStatusFromRecovery,
  type TenantOperation,
  type TenantOperationStatus,
  type TenantOperationsSurfaceStatus,
} from "./tenant-operation-status";

export const RSO_5_ID = "RSO-5" as const;
export const TENANT_OPERATIONS_CAPABILITY = "TenantOperations" as const;
export const TENANT_OPERATIONS_VERSION =
  "rso-5-tenant-operations-1" as const;
/** RSO-4 recovery workflow pack baseline. */
export const RSO4_RECOVERY_WORKFLOW_BASELINE =
  "rso4-recovery-workflow-v1" as const;

export type TenantOperations = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_5_ID;
  capability: typeof TENANT_OPERATIONS_CAPABILITY;
  version: typeof TENANT_OPERATIONS_VERSION;
  baselineTag: typeof RSO4_RECOVERY_WORKFLOW_BASELINE;
  parentPack: typeof RSO_4_ID;
  parentVersion: typeof RECOVERY_WORKFLOW_VERSION;
  parentBaseline: typeof RSO3_INCIDENT_MANAGEMENT_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  status: TenantOperationsSurfaceStatus;
  recoveryWorkflowStatus: RecoveryWorkflowStatus;
  operations: readonly TenantOperation[];
  operationCount: number;
  stableCount: number;
  watchCount: number;
  stagedCount: number;
  suspendedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  recoveryWorkflowFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noBilling: true;
    noLicense: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: TenantOperations | null = null;

function cloneOperations(row: TenantOperations): TenantOperations {
  return {
    ...row,
    operations: row.operations.map((o) => ({ ...o })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<TenantOperations, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    status: row.status,
    recoveryWorkflowStatus: row.recoveryWorkflowStatus,
    operations: row.operations,
    operationCount: row.operationCount,
    stableCount: row.stableCount,
    watchCount: row.watchCount,
    stagedCount: row.stagedCount,
    suspendedCount: row.suspendedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    recoveryWorkflowFingerprint: row.recoveryWorkflowFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<TenantOperations, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectOperation(
  action: RecoveryAction,
  ordinal: number,
): TenantOperation {
  const status = tenantOperationStatusFromRecovery(action.status);
  return {
    operationId: `rso5-op-${action.sourceCheckId.toLowerCase()}`,
    tenantId: `tenant-rso5-${action.sourceCheckId.toLowerCase()}`,
    sourceActionId: action.actionId,
    sourceCheckId: action.sourceCheckId,
    status,
    summary: action.summary,
    detail: action.detail,
    ordinal,
  };
}

function deriveFromRecovery(recovery: RecoveryWorkflow): TenantOperations {
  const operations = recovery.actions.map((action, index) =>
    projectOperation(action, index + 1),
  );
  const stableCount = operations.filter((o) => o.status === "STABLE").length;
  const watchCount = operations.filter((o) => o.status === "WATCH").length;
  const stagedCount = operations.filter((o) => o.status === "STAGED").length;
  const suspendedCount = operations.filter(
    (o) => o.status === "SUSPENDED",
  ).length;
  const status = aggregateTenantOperationsSurfaceStatus(
    operations.map((o) => o.status),
  );

  const withoutFp: Omit<TenantOperations, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_5_ID,
    capability: TENANT_OPERATIONS_CAPABILITY,
    version: TENANT_OPERATIONS_VERSION,
    baselineTag: RSO4_RECOVERY_WORKFLOW_BASELINE,
    parentPack: RSO_4_ID,
    parentVersion: RECOVERY_WORKFLOW_VERSION,
    parentBaseline: RSO3_INCIDENT_MANAGEMENT_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    status,
    recoveryWorkflowStatus: recovery.status,
    operations,
    operationCount: operations.length,
    stableCount,
    watchCount,
    stagedCount,
    suspendedCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    recoveryWorkflowFingerprint: recovery.fingerprint,
    scope: {
      readOnly: true,
      noBilling: true,
      noLicense: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build TenantOperations projection from RSO-4 RecoveryWorkflow. */
export function buildTenantOperations(): TenantOperations {
  const recovery = getRecoveryWorkflow();
  const out = deriveFromRecovery(recovery);
  cached = cloneOperations(out);
  return cloneOperations(cached);
}

/** Get last built TenantOperations, or build if none cached. */
export function getTenantOperations(): TenantOperations {
  if (!cached) {
    return buildTenantOperations();
  }
  return cloneOperations(cached);
}

/** Stable content fingerprint for determinism checks. */
export function tenantOperationsFingerprint(row?: TenantOperations): string {
  const v = row ?? getTenantOperations();
  return v.fingerprint;
}

/** Test helper — clears RSO-5 cache only. */
export function clearTenantOperations(): void {
  cached = null;
}

/** Ensure RSO-4 then build RSO-5 (verify scripts). */
export function ensureRecoveryThenBuildTenantOperations(): TenantOperations {
  buildRecoveryWorkflow();
  clearTenantOperations();
  return buildTenantOperations();
}

export type { TenantOperation, TenantOperationStatus, TenantOperationsSurfaceStatus };
