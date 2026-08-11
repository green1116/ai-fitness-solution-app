/**
 * ESCE-2 — Execution Outcome
 * Deterministic ExecutionOutcome from ESCE-1 CommercialExecution.
 * Baseline: esce1-commercial-execution-v1.
 * Outcome projection only — no CRM/billing / live execution / ESCO mutation.
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
import type { CommercialAction } from "../operations";
import {
  COMMERCIAL_EXECUTION_VERSION,
  ESCE_1_ID,
  ESCO_V1_BASELINE,
  buildCommercialExecution,
  getCommercialExecution,
  type CommercialExecution,
  type CommercialExecutionRecord,
  type CommercialExecutionStatus,
} from "./commercial-execution";

export const ESCE_2_ID = "ESCE-2" as const;
export const EXECUTION_OUTCOME_CAPABILITY = "ExecutionOutcome" as const;
export const EXECUTION_OUTCOME_VERSION = "esce-2-execution-outcome-1" as const;
export const ESCE1_COMMERCIAL_EXECUTION_BASELINE =
  "esce1-commercial-execution-v1" as const;

export const EXECUTION_OUTCOMES = ["APPLIED", "PENDING", "BLOCKED"] as const;
export type ExecutionOutcomeStatus = (typeof EXECUTION_OUTCOMES)[number];

export type ExecutionOutcomeRecord = Readonly<{
  customerId: string;
  tenantId: string;
  action: CommercialAction;
  executionStatus: CommercialExecutionStatus;
  outcome: ExecutionOutcomeStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ExecutionOutcome = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCE_2_ID;
  capability: typeof EXECUTION_OUTCOME_CAPABILITY;
  version: typeof EXECUTION_OUTCOME_VERSION;
  baselineTag: typeof ESCE1_COMMERCIAL_EXECUTION_BASELINE;
  parentPack: typeof ESCE_1_ID;
  parentVersion: typeof COMMERCIAL_EXECUTION_VERSION;
  parentBaseline: typeof ESCO_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly ExecutionOutcomeRecord[];
  recordCount: number;
  appliedCount: number;
  pendingCount: number;
  blockedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  commercialExecutionFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveExecution: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEscoMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ExecutionOutcome | null = null;

function cloneOutcome(row: ExecutionOutcome): ExecutionOutcome {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<ExecutionOutcome, "fingerprint">): string {
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
    records: row.records,
    recordCount: row.recordCount,
    appliedCount: row.appliedCount,
    pendingCount: row.pendingCount,
    blockedCount: row.blockedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    commercialExecutionFingerprint: row.commercialExecutionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<ExecutionOutcome, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<ExecutionOutcomeRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        action: row.action,
        executionStatus: row.executionStatus,
        outcome: row.outcome,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map execution status to outcome (no live side effects). */
export function executionOutcomeFromStatus(
  status: CommercialExecutionStatus,
): { outcome: ExecutionOutcomeStatus; reason: string } {
  if (status === "HELD") {
    return { outcome: "BLOCKED", reason: "blocked-from-held" };
  }
  if (status === "QUEUED") {
    return { outcome: "PENDING", reason: "pending-from-queued" };
  }
  return { outcome: "APPLIED", reason: "applied-from-recorded" };
}

function projectRecord(
  record: CommercialExecutionRecord,
): ExecutionOutcomeRecord {
  const mapped = executionOutcomeFromStatus(record.executionStatus);
  const withoutFp: Omit<ExecutionOutcomeRecord, "fingerprint"> = {
    customerId: record.customerId,
    tenantId: record.tenantId,
    action: record.action,
    executionStatus: record.executionStatus,
    outcome: mapped.outcome,
    reason: mapped.reason,
    ordinal: record.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromExecution(execution: CommercialExecution): ExecutionOutcome {
  const records = execution.records.map(projectRecord);
  const appliedCount = records.filter((r) => r.outcome === "APPLIED").length;
  const pendingCount = records.filter((r) => r.outcome === "PENDING").length;
  const blockedCount = records.filter((r) => r.outcome === "BLOCKED").length;

  const withoutFp: Omit<ExecutionOutcome, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCE_2_ID,
    capability: EXECUTION_OUTCOME_CAPABILITY,
    version: EXECUTION_OUTCOME_VERSION,
    baselineTag: ESCE1_COMMERCIAL_EXECUTION_BASELINE,
    parentPack: ESCE_1_ID,
    parentVersion: COMMERCIAL_EXECUTION_VERSION,
    parentBaseline: ESCO_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    appliedCount,
    pendingCount,
    blockedCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    commercialExecutionFingerprint: execution.fingerprint,
    scope: {
      readOnly: true,
      noLiveExecution: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noEscoMutation: true,
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

/** Build ExecutionOutcome from CommercialExecution. */
export function buildExecutionOutcome(
  execution?: CommercialExecution,
): ExecutionOutcome {
  const source = execution ?? getCommercialExecution();
  const out = deriveFromExecution(source);
  cached = cloneOutcome(out);
  return cloneOutcome(cached);
}

export function getExecutionOutcome(): ExecutionOutcome {
  if (!cached) {
    return buildExecutionOutcome();
  }
  return cloneOutcome(cached);
}

export function executionOutcomeFingerprint(row?: ExecutionOutcome): string {
  const v = row ?? getExecutionOutcome();
  return v.fingerprint;
}

export function clearExecutionOutcome(): void {
  cached = null;
}

export function ensureExecutionThenBuildOutcome(): ExecutionOutcome {
  buildCommercialExecution();
  clearExecutionOutcome();
  return buildExecutionOutcome();
}
