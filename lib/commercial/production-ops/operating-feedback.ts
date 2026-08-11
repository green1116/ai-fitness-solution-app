/**
 * ESPO-4 — Operating Feedback
 * Deterministic OperatingFeedback from ESPO-3 OperatingOutcome.
 * Baseline: espo-3-operating-outcome-1.
 * Read-only — no persistence / external execution / CRM / billing / frozen-layer mutation.
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
  ESPO2_OPERATING_DECISION_BASELINE,
  ESPO_3_ID,
  OPERATING_OUTCOME_VERSION,
  buildOperatingOutcome,
  getOperatingOutcome,
  type OperatingOutcome,
  type OperatingOutcomeKind,
  type OperatingOutcomeRecord,
} from "./operating-outcome";
import type { OperatingQueueStatus } from "./operating-queue";

export const ESPO_4_ID = "ESPO-4" as const;
export const OPERATING_FEEDBACK_CAPABILITY = "OperatingFeedback" as const;
export const OPERATING_FEEDBACK_VERSION =
  "espo-4-operating-feedback-1" as const;
export const ESPO3_OPERATING_OUTCOME_BASELINE =
  "espo3-operating-outcome-v1" as const;

export const OPERATING_FEEDBACK_SIGNALS = [
  "HOLD",
  "MONITOR",
  "ENABLE",
  "ESCALATE",
] as const;
export type OperatingFeedbackSignal =
  (typeof OPERATING_FEEDBACK_SIGNALS)[number];

export type OperatingFeedbackRecord = Readonly<{
  id: string;
  outcomeId: string;
  customerId: string;
  signal: OperatingFeedbackSignal;
  status: OperatingQueueStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type OperatingFeedback = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESPO_4_ID;
  capability: typeof OPERATING_FEEDBACK_CAPABILITY;
  version: typeof OPERATING_FEEDBACK_VERSION;
  baselineTag: typeof ESPO3_OPERATING_OUTCOME_BASELINE;
  parentPack: typeof ESPO_3_ID;
  parentVersion: typeof OPERATING_OUTCOME_VERSION;
  parentBaseline: typeof ESPO2_OPERATING_DECISION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly OperatingFeedbackRecord[];
  recordCount: number;
  holdCount: number;
  monitorCount: number;
  enableCount: number;
  escalateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  operatingOutcomeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noMarketingExecution: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
    noEscpMutation: true;
    noEsciMutation: true;
    noEscaMutation: true;
    noEsrnMutation: true;
    noEsxpMutation: true;
    noEscrMutation: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: OperatingFeedback | null = null;

function cloneFeedback(row: OperatingFeedback): OperatingFeedback {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<OperatingFeedback, "fingerprint">): string {
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
    holdCount: row.holdCount,
    monitorCount: row.monitorCount,
    enableCount: row.enableCount,
    escalateCount: row.escalateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    operatingOutcomeFingerprint: row.operatingOutcomeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<OperatingFeedback, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<OperatingFeedbackRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        outcomeId: row.outcomeId,
        customerId: row.customerId,
        signal: row.signal,
        status: row.status,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stableFeedbackId(outcomeId: string): string {
  return outcomeId.replace(/^espo-3:/, "espo-4:");
}

/** Map operating outcome to a read-only feedback signal. */
export function operatingFeedbackFromOutcome(outcome: OperatingOutcomeKind): {
  signal: OperatingFeedbackSignal;
  status: OperatingQueueStatus;
  reason: string;
} {
  if (outcome === "RECORDED") {
    return {
      signal: "ESCALATE",
      status: "OPEN",
      reason: "escalate-from-recorded",
    };
  }
  if (outcome === "PENDING") {
    return {
      signal: "ENABLE",
      status: "QUEUED",
      reason: "enable-from-pending",
    };
  }
  if (outcome === "OBSERVED") {
    return {
      signal: "MONITOR",
      status: "WATCH",
      reason: "monitor-from-observed",
    };
  }
  return {
    signal: "HOLD",
    status: "HELD",
    reason: "hold-from-deferred",
  };
}

function projectRecord(rec: OperatingOutcomeRecord): OperatingFeedbackRecord {
  const mapped = operatingFeedbackFromOutcome(rec.outcome);
  const withoutFp: Omit<OperatingFeedbackRecord, "fingerprint"> = {
    id: stableFeedbackId(rec.id),
    outcomeId: rec.id,
    customerId: rec.customerId,
    signal: mapped.signal,
    status: mapped.status,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromOutcome(outcome: OperatingOutcome): OperatingFeedback {
  const records = outcome.records.map(projectRecord);
  const withoutFp: Omit<OperatingFeedback, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESPO_4_ID,
    capability: OPERATING_FEEDBACK_CAPABILITY,
    version: OPERATING_FEEDBACK_VERSION,
    baselineTag: ESPO3_OPERATING_OUTCOME_BASELINE,
    parentPack: ESPO_3_ID,
    parentVersion: OPERATING_OUTCOME_VERSION,
    parentBaseline: ESPO2_OPERATING_DECISION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.signal === "HOLD").length,
    monitorCount: records.filter((r) => r.signal === "MONITOR").length,
    enableCount: records.filter((r) => r.signal === "ENABLE").length,
    escalateCount: records.filter((r) => r.signal === "ESCALATE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    operatingOutcomeFingerprint: outcome.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEscpMutation: true,
      noEsciMutation: true,
      noEscaMutation: true,
      noEsrnMutation: true,
      noEsxpMutation: true,
      noEscrMutation: true,
      noEscsMutation: true,
      noEsclMutation: true,
      noEsceMutation: true,
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

export function buildOperatingFeedback(
  outcome?: OperatingOutcome,
): OperatingFeedback {
  const source = outcome ?? getOperatingOutcome();
  const out = deriveFromOutcome(source);
  cached = cloneFeedback(out);
  return cloneFeedback(cached);
}

export function getOperatingFeedback(): OperatingFeedback {
  if (!cached) {
    return buildOperatingFeedback();
  }
  return cloneFeedback(cached);
}

export function operatingFeedbackFingerprint(
  row?: OperatingFeedback,
): string {
  const v = row ?? getOperatingFeedback();
  return v.fingerprint;
}

export function clearOperatingFeedback(): void {
  cached = null;
}

export function ensureOutcomeThenBuildOperatingFeedback(): OperatingFeedback {
  buildOperatingOutcome();
  clearOperatingFeedback();
  return buildOperatingFeedback();
}
