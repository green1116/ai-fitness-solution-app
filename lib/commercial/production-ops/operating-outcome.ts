/**
 * ESPO-3 — Operating Outcome
 * Deterministic OperatingOutcome from ESPO-2 OperatingDecision.
 * Baseline: espo-2-operating-decision-1.
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
  ESPO1_OPERATING_QUEUE_BASELINE,
  ESPO_2_ID,
  OPERATING_DECISION_VERSION,
  buildOperatingDecision,
  getOperatingDecision,
  type OperatingDecision,
  type OperatingDecisionKind,
  type OperatingDecisionRecord,
} from "./operating-decision";
import type { OperatingQueueStatus } from "./operating-queue";

export const ESPO_3_ID = "ESPO-3" as const;
export const OPERATING_OUTCOME_CAPABILITY = "OperatingOutcome" as const;
export const OPERATING_OUTCOME_VERSION = "espo-3-operating-outcome-1" as const;
export const ESPO2_OPERATING_DECISION_BASELINE =
  "espo2-operating-decision-v1" as const;

export const OPERATING_OUTCOMES = [
  "DEFERRED",
  "OBSERVED",
  "PENDING",
  "RECORDED",
] as const;
export type OperatingOutcomeKind = (typeof OPERATING_OUTCOMES)[number];

export type OperatingOutcomeRecord = Readonly<{
  id: string;
  decisionId: string;
  customerId: string;
  outcome: OperatingOutcomeKind;
  status: OperatingQueueStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type OperatingOutcome = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESPO_3_ID;
  capability: typeof OPERATING_OUTCOME_CAPABILITY;
  version: typeof OPERATING_OUTCOME_VERSION;
  baselineTag: typeof ESPO2_OPERATING_DECISION_BASELINE;
  parentPack: typeof ESPO_2_ID;
  parentVersion: typeof OPERATING_DECISION_VERSION;
  parentBaseline: typeof ESPO1_OPERATING_QUEUE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly OperatingOutcomeRecord[];
  recordCount: number;
  deferredCount: number;
  observedCount: number;
  pendingCount: number;
  recordedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  operatingDecisionFingerprint: string;
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

let cached: OperatingOutcome | null = null;

function cloneOutcome(row: OperatingOutcome): OperatingOutcome {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<OperatingOutcome, "fingerprint">): string {
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
    deferredCount: row.deferredCount,
    observedCount: row.observedCount,
    pendingCount: row.pendingCount,
    recordedCount: row.recordedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    operatingDecisionFingerprint: row.operatingDecisionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<OperatingOutcome, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<OperatingOutcomeRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        decisionId: row.decisionId,
        customerId: row.customerId,
        outcome: row.outcome,
        status: row.status,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stableOutcomeId(decisionId: string): string {
  return decisionId.replace(/^espo-2:/, "espo-3:");
}

/** Map operating decision to a read-only outcome. */
export function operatingOutcomeFromDecision(decision: OperatingDecisionKind): {
  outcome: OperatingOutcomeKind;
  status: OperatingQueueStatus;
  reason: string;
} {
  if (decision === "ACT") {
    return {
      outcome: "RECORDED",
      status: "OPEN",
      reason: "recorded-from-act",
    };
  }
  if (decision === "PREPARE") {
    return {
      outcome: "PENDING",
      status: "QUEUED",
      reason: "pending-from-prepare",
    };
  }
  if (decision === "WATCH") {
    return {
      outcome: "OBSERVED",
      status: "WATCH",
      reason: "observed-from-watch",
    };
  }
  return {
    outcome: "DEFERRED",
    status: "HELD",
    reason: "deferred-from-hold",
  };
}

function projectRecord(rec: OperatingDecisionRecord): OperatingOutcomeRecord {
  const mapped = operatingOutcomeFromDecision(rec.decision);
  const withoutFp: Omit<OperatingOutcomeRecord, "fingerprint"> = {
    id: stableOutcomeId(rec.id),
    decisionId: rec.id,
    customerId: rec.customerId,
    outcome: mapped.outcome,
    status: mapped.status,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromDecision(decision: OperatingDecision): OperatingOutcome {
  const records = decision.records.map(projectRecord);
  const withoutFp: Omit<OperatingOutcome, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESPO_3_ID,
    capability: OPERATING_OUTCOME_CAPABILITY,
    version: OPERATING_OUTCOME_VERSION,
    baselineTag: ESPO2_OPERATING_DECISION_BASELINE,
    parentPack: ESPO_2_ID,
    parentVersion: OPERATING_DECISION_VERSION,
    parentBaseline: ESPO1_OPERATING_QUEUE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    deferredCount: records.filter((r) => r.outcome === "DEFERRED").length,
    observedCount: records.filter((r) => r.outcome === "OBSERVED").length,
    pendingCount: records.filter((r) => r.outcome === "PENDING").length,
    recordedCount: records.filter((r) => r.outcome === "RECORDED").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    operatingDecisionFingerprint: decision.fingerprint,
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

export function buildOperatingOutcome(
  decision?: OperatingDecision,
): OperatingOutcome {
  const source = decision ?? getOperatingDecision();
  const out = deriveFromDecision(source);
  cached = cloneOutcome(out);
  return cloneOutcome(cached);
}

export function getOperatingOutcome(): OperatingOutcome {
  if (!cached) {
    return buildOperatingOutcome();
  }
  return cloneOutcome(cached);
}

export function operatingOutcomeFingerprint(row?: OperatingOutcome): string {
  const v = row ?? getOperatingOutcome();
  return v.fingerprint;
}

export function clearOperatingOutcome(): void {
  cached = null;
}

export function ensureDecisionThenBuildOperatingOutcome(): OperatingOutcome {
  buildOperatingDecision();
  clearOperatingOutcome();
  return buildOperatingOutcome();
}
