/**
 * ESCR-1 — Retention State
 * Deterministic RetentionState from existing ESCS CustomerSuccessReview.
 * Baseline: enterprise-saas-customer-success-v1.
 * Read-only — no persistence / runtime side effects / CRM / billing / ESCS / ESCL / ESCE mutation.
 */

import { createHash } from "node:crypto";

import {
  CUSTOMER_SUCCESS_REVIEW_VERSION,
  ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1,
  ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE,
  ESCS_4_ID,
  getCustomerSuccessReview,
  type CustomerSuccessInterventionKind,
  type CustomerSuccessOutcomeKind,
  type CustomerSuccessReview,
  type CustomerSuccessReviewRecord,
  type CustomerSuccessReviewStatus,
  type CustomerSuccessStateLevel,
} from "../customer-success";
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

export const ESCR_1_ID = "ESCR-1" as const;
export const RETENTION_STATE_CAPABILITY = "RetentionState" as const;
export const RETENTION_STATE_VERSION = "escr-1-retention-state-1" as const;
export const ESCS_V1_BASELINE = ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1;

export const RETENTION_STATES = [
  "SECURE",
  "ADOPT",
  "EXPAND",
  "WATCH",
  "RISK",
] as const;
export type RetentionStateLevel = (typeof RETENTION_STATES)[number];

export type RetentionStateRecord = Readonly<{
  customerId: string;
  tenantId: string;
  state: RetentionStateLevel;
  successState: CustomerSuccessStateLevel;
  intervention: CustomerSuccessInterventionKind;
  outcome: CustomerSuccessOutcomeKind;
  reviewStatus: CustomerSuccessReviewStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type RetentionState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCR_1_ID;
  capability: typeof RETENTION_STATE_CAPABILITY;
  version: typeof RETENTION_STATE_VERSION;
  baselineTag: typeof ESCS_V1_BASELINE;
  parentPack: typeof ESCS_4_ID;
  parentVersion: typeof CUSTOMER_SUCCESS_REVIEW_VERSION;
  parentBaseline: typeof ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly RetentionStateRecord[];
  recordCount: number;
  secureCount: number;
  adoptCount: number;
  expandCount: number;
  watchCount: number;
  riskCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerSuccessReviewFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: RetentionState | null = null;

function cloneState(row: RetentionState): RetentionState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<RetentionState, "fingerprint">): string {
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
    secureCount: row.secureCount,
    adoptCount: row.adoptCount,
    expandCount: row.expandCount,
    watchCount: row.watchCount,
    riskCount: row.riskCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerSuccessReviewFingerprint: row.customerSuccessReviewFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RetentionState, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<RetentionStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        state: row.state,
        successState: row.successState,
        intervention: row.intervention,
        outcome: row.outcome,
        reviewStatus: row.reviewStatus,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map ESCS signals to a read-only retention state. */
export function retentionStateFromSignals(input: {
  successState: CustomerSuccessStateLevel;
  intervention: CustomerSuccessInterventionKind;
  outcome: CustomerSuccessOutcomeKind;
  reviewStatus: CustomerSuccessReviewStatus;
}): { state: RetentionStateLevel; reason: string } {
  if (
    input.successState === "RISK" ||
    input.intervention === "INTERVENE" ||
    input.outcome === "RECOVER" ||
    input.reviewStatus === "ACTION_REQUIRED"
  ) {
    return { state: "RISK", reason: "risk-from-escs" };
  }
  if (
    input.successState === "ATTENTION" ||
    input.intervention === "ASSIST" ||
    input.outcome === "STABILIZE" ||
    input.reviewStatus === "WATCH"
  ) {
    return { state: "WATCH", reason: "watch-from-escs" };
  }
  if (
    input.successState === "GROWING" ||
    input.intervention === "ENABLE" ||
    input.outcome === "GROW"
  ) {
    return { state: "EXPAND", reason: "expand-from-escs" };
  }
  if (
    input.successState === "ADOPTING" ||
    input.intervention === "GUIDE" ||
    input.outcome === "ADOPT"
  ) {
    return { state: "ADOPT", reason: "adopt-from-escs" };
  }
  return { state: "SECURE", reason: "secure-from-escs" };
}

function projectRecord(rec: CustomerSuccessReviewRecord): RetentionStateRecord {
  const mapped = retentionStateFromSignals({
    successState: rec.fromState,
    intervention: rec.intervention,
    outcome: rec.outcome,
    reviewStatus: rec.reviewStatus,
  });
  const withoutFp: Omit<RetentionStateRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    state: mapped.state,
    successState: rec.fromState,
    intervention: rec.intervention,
    outcome: rec.outcome,
    reviewStatus: rec.reviewStatus,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromReview(review: CustomerSuccessReview): RetentionState {
  const records = review.records.map(projectRecord);
  const secureCount = records.filter((r) => r.state === "SECURE").length;
  const adoptCount = records.filter((r) => r.state === "ADOPT").length;
  const expandCount = records.filter((r) => r.state === "EXPAND").length;
  const watchCount = records.filter((r) => r.state === "WATCH").length;
  const riskCount = records.filter((r) => r.state === "RISK").length;

  const withoutFp: Omit<RetentionState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCR_1_ID,
    capability: RETENTION_STATE_CAPABILITY,
    version: RETENTION_STATE_VERSION,
    baselineTag: ESCS_V1_BASELINE,
    parentPack: ESCS_4_ID,
    parentVersion: CUSTOMER_SUCCESS_REVIEW_VERSION,
    parentBaseline: ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    secureCount,
    adoptCount,
    expandCount,
    watchCount,
    riskCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerSuccessReviewFingerprint: review.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
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

export function buildRetentionState(
  review?: CustomerSuccessReview,
): RetentionState {
  const source = review ?? getCustomerSuccessReview();
  const out = deriveFromReview(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getRetentionState(): RetentionState {
  if (!cached) {
    return buildRetentionState();
  }
  return cloneState(cached);
}

export function retentionStateFingerprint(row?: RetentionState): string {
  const v = row ?? getRetentionState();
  return v.fingerprint;
}

export function clearRetentionState(): void {
  cached = null;
}
