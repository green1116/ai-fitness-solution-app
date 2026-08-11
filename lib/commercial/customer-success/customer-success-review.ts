/**
 * ESCS-4 — Customer Success Review
 * Deterministic CustomerSuccessReview from ESCS-3 CustomerSuccessOutcome.
 * Baseline: escs3-customer-success-outcome-v1.
 * Review only — no persistence / runtime side effects / CRM / billing / ESCL / ESCE mutation.
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
import type { CustomerSuccessStateLevel } from "./customer-success-state";
import type { CustomerSuccessInterventionKind } from "./customer-success-intervention";
import {
  ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE,
  ESCS_3_ID,
  CUSTOMER_SUCCESS_OUTCOME_VERSION,
  buildCustomerSuccessOutcome,
  getCustomerSuccessOutcome,
  type CustomerSuccessOutcome,
  type CustomerSuccessOutcomeKind,
  type CustomerSuccessOutcomeRecord,
} from "./customer-success-outcome";

export const ESCS_4_ID = "ESCS-4" as const;
export const CUSTOMER_SUCCESS_REVIEW_CAPABILITY =
  "CustomerSuccessReview" as const;
export const CUSTOMER_SUCCESS_REVIEW_VERSION =
  "escs-4-customer-success-review-1" as const;
export const ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE =
  "escs3-customer-success-outcome-v1" as const;

export const CUSTOMER_SUCCESS_REVIEW_STATUSES = [
  "STABLE",
  "WATCH",
  "ACTION_REQUIRED",
] as const;
export type CustomerSuccessReviewStatus =
  (typeof CUSTOMER_SUCCESS_REVIEW_STATUSES)[number];

export type CustomerSuccessReviewRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: CustomerSuccessStateLevel;
  intervention: CustomerSuccessInterventionKind;
  outcome: CustomerSuccessOutcomeKind;
  reviewStatus: CustomerSuccessReviewStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerSuccessReview = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCS_4_ID;
  capability: typeof CUSTOMER_SUCCESS_REVIEW_CAPABILITY;
  version: typeof CUSTOMER_SUCCESS_REVIEW_VERSION;
  baselineTag: typeof ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE;
  parentPack: typeof ESCS_3_ID;
  parentVersion: typeof CUSTOMER_SUCCESS_OUTCOME_VERSION;
  parentBaseline: typeof ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerSuccessReviewRecord[];
  recordCount: number;
  stableCount: number;
  watchCount: number;
  actionRequiredCount: number;
  lifecycleComplete: true;
  freezeReady: true;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerSuccessOutcomeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: CustomerSuccessReview | null = null;

function cloneReview(row: CustomerSuccessReview): CustomerSuccessReview {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerSuccessReview, "fingerprint">,
): string {
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
    stableCount: row.stableCount,
    watchCount: row.watchCount,
    actionRequiredCount: row.actionRequiredCount,
    lifecycleComplete: row.lifecycleComplete,
    freezeReady: row.freezeReady,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerSuccessOutcomeFingerprint: row.customerSuccessOutcomeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerSuccessReview, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerSuccessReviewRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        intervention: row.intervention,
        outcome: row.outcome,
        reviewStatus: row.reviewStatus,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map success outcome to review status (no execution). */
export function customerSuccessReviewStatusFromOutcome(
  outcome: CustomerSuccessOutcomeKind,
): { reviewStatus: CustomerSuccessReviewStatus; reason: string } {
  if (outcome === "RECOVER") {
    return { reviewStatus: "ACTION_REQUIRED", reason: "action-required-recover" };
  }
  if (outcome === "STABILIZE" || outcome === "GROW" || outcome === "ADOPT") {
    return { reviewStatus: "WATCH", reason: "watch-from-outcome" };
  }
  return { reviewStatus: "STABLE", reason: "stable-from-sustain" };
}

function projectRecord(
  rec: CustomerSuccessOutcomeRecord,
): CustomerSuccessReviewRecord {
  const mapped = customerSuccessReviewStatusFromOutcome(rec.outcome);
  const withoutFp: Omit<CustomerSuccessReviewRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    intervention: rec.intervention,
    outcome: rec.outcome,
    reviewStatus: mapped.reviewStatus,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromOutcome(
  outcome: CustomerSuccessOutcome,
): CustomerSuccessReview {
  const records = outcome.records.map(projectRecord);
  const stableCount = records.filter((r) => r.reviewStatus === "STABLE").length;
  const watchCount = records.filter((r) => r.reviewStatus === "WATCH").length;
  const actionRequiredCount = records.filter(
    (r) => r.reviewStatus === "ACTION_REQUIRED",
  ).length;

  const withoutFp: Omit<CustomerSuccessReview, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCS_4_ID,
    capability: CUSTOMER_SUCCESS_REVIEW_CAPABILITY,
    version: CUSTOMER_SUCCESS_REVIEW_VERSION,
    baselineTag: ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE,
    parentPack: ESCS_3_ID,
    parentVersion: CUSTOMER_SUCCESS_OUTCOME_VERSION,
    parentBaseline: ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    stableCount,
    watchCount,
    actionRequiredCount,
    lifecycleComplete: true,
    freezeReady: true,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerSuccessOutcomeFingerprint: outcome.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
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

export function buildCustomerSuccessReview(
  outcome?: CustomerSuccessOutcome,
): CustomerSuccessReview {
  const source = outcome ?? getCustomerSuccessOutcome();
  const out = deriveFromOutcome(source);
  cached = cloneReview(out);
  return cloneReview(cached);
}

export function getCustomerSuccessReview(): CustomerSuccessReview {
  if (!cached) {
    return buildCustomerSuccessReview();
  }
  return cloneReview(cached);
}

export function customerSuccessReviewFingerprint(
  row?: CustomerSuccessReview,
): string {
  const v = row ?? getCustomerSuccessReview();
  return v.fingerprint;
}

export function clearCustomerSuccessReview(): void {
  cached = null;
}

export function ensureOutcomeThenBuildCustomerSuccessReview(): CustomerSuccessReview {
  buildCustomerSuccessOutcome();
  clearCustomerSuccessReview();
  return buildCustomerSuccessReview();
}
