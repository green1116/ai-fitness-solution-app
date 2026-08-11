/**
 * ESCE-1 — Commercial Execution Foundation
 * Deterministic CommercialExecution from ESCO-3 CommercialActionSignal.
 * Baseline: enterprise-saas-commercial-operations-v1.
 * Records intent only — no CRM/billing / live execution / ESCO mutation.
 */

import { createHash } from "node:crypto";

import {
  COMMERCIAL_ACTION_SIGNAL_VERSION,
  ESCO2_COMMERCIAL_HEALTH_BASELINE,
  ESCO_3_ID,
  ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1,
  getCommercialActionSignal,
  type CommercialAction,
  type CommercialActionSignal,
  type CommercialActionSignalRecord,
} from "../operations";
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

export const ESCE_1_ID = "ESCE-1" as const;
export const COMMERCIAL_EXECUTION_CAPABILITY = "CommercialExecution" as const;
export const COMMERCIAL_EXECUTION_VERSION =
  "esce-1-commercial-execution-1" as const;
export const ESCO_V1_BASELINE = ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1;

export const COMMERCIAL_EXECUTION_STATUSES = [
  "RECORDED",
  "QUEUED",
  "HELD",
] as const;
export type CommercialExecutionStatus =
  (typeof COMMERCIAL_EXECUTION_STATUSES)[number];

export type CommercialExecutionRecord = Readonly<{
  customerId: string;
  tenantId: string;
  action: CommercialAction;
  executionStatus: CommercialExecutionStatus;
  reason: string;
  sourceSignalFingerprint: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CommercialExecution = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCE_1_ID;
  capability: typeof COMMERCIAL_EXECUTION_CAPABILITY;
  version: typeof COMMERCIAL_EXECUTION_VERSION;
  baselineTag: typeof ESCO_V1_BASELINE;
  parentPack: typeof ESCO_3_ID;
  parentVersion: typeof COMMERCIAL_ACTION_SIGNAL_VERSION;
  parentBaseline: typeof ESCO2_COMMERCIAL_HEALTH_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CommercialExecutionRecord[];
  recordCount: number;
  recordedCount: number;
  queuedCount: number;
  heldCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  commercialActionSignalFingerprint: string;
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

let cached: CommercialExecution | null = null;

function cloneExecution(row: CommercialExecution): CommercialExecution {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<CommercialExecution, "fingerprint">): string {
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
    recordedCount: row.recordedCount,
    queuedCount: row.queuedCount,
    heldCount: row.heldCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    commercialActionSignalFingerprint: row.commercialActionSignalFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CommercialExecution, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CommercialExecutionRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        action: row.action,
        executionStatus: row.executionStatus,
        reason: row.reason,
        sourceSignalFingerprint: row.sourceSignalFingerprint,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map action signal to execution status (intent only, not executed). */
export function commercialExecutionStatusFromAction(
  action: CommercialAction,
): { executionStatus: CommercialExecutionStatus; reason: string } {
  if (action === "ESCALATE") {
    return { executionStatus: "HELD", reason: "held-escalate" };
  }
  if (action === "WATCH" || action === "EXPAND") {
    return { executionStatus: "QUEUED", reason: "queued-from-action" };
  }
  return { executionStatus: "RECORDED", reason: "recorded-retain" };
}

function projectRecord(
  signal: CommercialActionSignalRecord,
): CommercialExecutionRecord {
  const mapped = commercialExecutionStatusFromAction(signal.action);
  const withoutFp: Omit<CommercialExecutionRecord, "fingerprint"> = {
    customerId: signal.customerId,
    tenantId: signal.tenantId,
    action: signal.action,
    executionStatus: mapped.executionStatus,
    reason: mapped.reason,
    sourceSignalFingerprint: signal.fingerprint,
    ordinal: signal.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromSignal(signal: CommercialActionSignal): CommercialExecution {
  const records = signal.signals.map(projectRecord);
  const recordedCount = records.filter((r) => r.executionStatus === "RECORDED")
    .length;
  const queuedCount = records.filter((r) => r.executionStatus === "QUEUED")
    .length;
  const heldCount = records.filter((r) => r.executionStatus === "HELD").length;

  const withoutFp: Omit<CommercialExecution, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCE_1_ID,
    capability: COMMERCIAL_EXECUTION_CAPABILITY,
    version: COMMERCIAL_EXECUTION_VERSION,
    baselineTag: ESCO_V1_BASELINE,
    parentPack: ESCO_3_ID,
    parentVersion: COMMERCIAL_ACTION_SIGNAL_VERSION,
    parentBaseline: ESCO2_COMMERCIAL_HEALTH_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    recordedCount,
    queuedCount,
    heldCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    commercialActionSignalFingerprint: signal.fingerprint,
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

/** Build CommercialExecution from CommercialActionSignal. */
export function buildCommercialExecution(
  signal?: CommercialActionSignal,
): CommercialExecution {
  const source = signal ?? getCommercialActionSignal();
  const out = deriveFromSignal(source);
  cached = cloneExecution(out);
  return cloneExecution(cached);
}

export function getCommercialExecution(): CommercialExecution {
  if (!cached) {
    return buildCommercialExecution();
  }
  return cloneExecution(cached);
}

export function commercialExecutionFingerprint(
  row?: CommercialExecution,
): string {
  const v = row ?? getCommercialExecution();
  return v.fingerprint;
}

export function clearCommercialExecution(): void {
  cached = null;
}
