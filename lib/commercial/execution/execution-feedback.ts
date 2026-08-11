/**
 * ESCE-3 — Execution Feedback
 * Deterministic ExecutionFeedback from ESCE-2 ExecutionOutcome.
 * Baseline: esce2-execution-outcome-v1.
 * Feedback projection only — no CRM/billing / live execution / ESCO mutation.
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
  ESCE1_COMMERCIAL_EXECUTION_BASELINE,
  ESCE_2_ID,
  EXECUTION_OUTCOME_VERSION,
  buildExecutionOutcome,
  getExecutionOutcome,
  type ExecutionOutcome,
  type ExecutionOutcomeRecord,
  type ExecutionOutcomeStatus,
} from "./execution-outcome";

export const ESCE_3_ID = "ESCE-3" as const;
export const EXECUTION_FEEDBACK_CAPABILITY = "ExecutionFeedback" as const;
export const EXECUTION_FEEDBACK_VERSION =
  "esce-3-execution-feedback-1" as const;
export const ESCE2_EXECUTION_OUTCOME_BASELINE =
  "esce2-execution-outcome-v1" as const;

export const EXECUTION_FEEDBACK_STATUSES = [
  "CLOSED",
  "WATCH",
  "OPEN",
] as const;
export type ExecutionFeedbackStatus =
  (typeof EXECUTION_FEEDBACK_STATUSES)[number];

export type ExecutionFeedbackRecord = Readonly<{
  customerId: string;
  tenantId: string;
  action: CommercialAction;
  outcome: ExecutionOutcomeStatus;
  feedback: ExecutionFeedbackStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ExecutionFeedback = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCE_3_ID;
  capability: typeof EXECUTION_FEEDBACK_CAPABILITY;
  version: typeof EXECUTION_FEEDBACK_VERSION;
  baselineTag: typeof ESCE2_EXECUTION_OUTCOME_BASELINE;
  parentPack: typeof ESCE_2_ID;
  parentVersion: typeof EXECUTION_OUTCOME_VERSION;
  parentBaseline: typeof ESCE1_COMMERCIAL_EXECUTION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly ExecutionFeedbackRecord[];
  recordCount: number;
  closedCount: number;
  watchCount: number;
  openCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  executionOutcomeFingerprint: string;
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

let cached: ExecutionFeedback | null = null;

function cloneFeedback(row: ExecutionFeedback): ExecutionFeedback {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<ExecutionFeedback, "fingerprint">): string {
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
    closedCount: row.closedCount,
    watchCount: row.watchCount,
    openCount: row.openCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    executionOutcomeFingerprint: row.executionOutcomeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ExecutionFeedback, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<ExecutionFeedbackRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        action: row.action,
        outcome: row.outcome,
        feedback: row.feedback,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map execution outcome to feedback status. */
export function executionFeedbackFromOutcome(
  outcome: ExecutionOutcomeStatus,
): { feedback: ExecutionFeedbackStatus; reason: string } {
  if (outcome === "BLOCKED") {
    return { feedback: "OPEN", reason: "open-from-blocked" };
  }
  if (outcome === "PENDING") {
    return { feedback: "WATCH", reason: "watch-from-pending" };
  }
  return { feedback: "CLOSED", reason: "closed-from-applied" };
}

function projectRecord(
  record: ExecutionOutcomeRecord,
): ExecutionFeedbackRecord {
  const mapped = executionFeedbackFromOutcome(record.outcome);
  const withoutFp: Omit<ExecutionFeedbackRecord, "fingerprint"> = {
    customerId: record.customerId,
    tenantId: record.tenantId,
    action: record.action,
    outcome: record.outcome,
    feedback: mapped.feedback,
    reason: mapped.reason,
    ordinal: record.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromOutcome(outcome: ExecutionOutcome): ExecutionFeedback {
  const records = outcome.records.map(projectRecord);
  const closedCount = records.filter((r) => r.feedback === "CLOSED").length;
  const watchCount = records.filter((r) => r.feedback === "WATCH").length;
  const openCount = records.filter((r) => r.feedback === "OPEN").length;

  const withoutFp: Omit<ExecutionFeedback, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCE_3_ID,
    capability: EXECUTION_FEEDBACK_CAPABILITY,
    version: EXECUTION_FEEDBACK_VERSION,
    baselineTag: ESCE2_EXECUTION_OUTCOME_BASELINE,
    parentPack: ESCE_2_ID,
    parentVersion: EXECUTION_OUTCOME_VERSION,
    parentBaseline: ESCE1_COMMERCIAL_EXECUTION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    closedCount,
    watchCount,
    openCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    executionOutcomeFingerprint: outcome.fingerprint,
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

/** Build ExecutionFeedback from ExecutionOutcome. */
export function buildExecutionFeedback(
  outcome?: ExecutionOutcome,
): ExecutionFeedback {
  const source = outcome ?? getExecutionOutcome();
  const out = deriveFromOutcome(source);
  cached = cloneFeedback(out);
  return cloneFeedback(cached);
}

export function getExecutionFeedback(): ExecutionFeedback {
  if (!cached) {
    return buildExecutionFeedback();
  }
  return cloneFeedback(cached);
}

export function executionFeedbackFingerprint(row?: ExecutionFeedback): string {
  const v = row ?? getExecutionFeedback();
  return v.fingerprint;
}

export function clearExecutionFeedback(): void {
  cached = null;
}

export function ensureOutcomeThenBuildFeedback(): ExecutionFeedback {
  buildExecutionOutcome();
  clearExecutionFeedback();
  return buildExecutionFeedback();
}
