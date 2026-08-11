/**
 * ESCS-1 — Customer Success State
 * Deterministic CustomerSuccessState from existing ESCL / ESCE signals.
 * Baseline: enterprise-saas-customer-lifecycle-operations-v1.
 * Read-only — no persistence / runtime side effects / CRM / billing / ESCL / ESCE mutation.
 */

import { createHash } from "node:crypto";

import {
  getExecutionFeedback,
  type ExecutionFeedbackStatus,
} from "../execution";
import {
  ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1,
  ESCL3_LIFECYCLE_ACTION_BASELINE,
  ESCL_4_ID,
  LIFECYCLE_REVIEW_VERSION,
  getCustomerLifecycleState,
  getLifecycleReview,
  type CustomerLifecycleStateLevel,
  type LifecycleActionKind,
  type LifecycleReview,
  type LifecycleReviewRecord,
  type LifecycleReviewStatus,
} from "../lifecycle";
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

export const ESCS_1_ID = "ESCS-1" as const;
export const CUSTOMER_SUCCESS_STATE_CAPABILITY = "CustomerSuccessState" as const;
export const CUSTOMER_SUCCESS_STATE_VERSION =
  "escs-1-customer-success-state-1" as const;
export const ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1 =
  "enterprise-saas-customer-lifecycle-operations-v1" as const;
export const ESCL_V1_BASELINE = ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1;

export const CUSTOMER_SUCCESS_STATES = [
  "HEALTHY",
  "ADOPTING",
  "GROWING",
  "ATTENTION",
  "RISK",
] as const;
export type CustomerSuccessStateLevel =
  (typeof CUSTOMER_SUCCESS_STATES)[number];

export type CustomerSuccessStateRecord = Readonly<{
  customerId: string;
  tenantId: string;
  state: CustomerSuccessStateLevel;
  lifecycleState: CustomerLifecycleStateLevel;
  action: LifecycleActionKind;
  reviewStatus: LifecycleReviewStatus;
  sourceFeedback: ExecutionFeedbackStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerSuccessState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCS_1_ID;
  capability: typeof CUSTOMER_SUCCESS_STATE_CAPABILITY;
  version: typeof CUSTOMER_SUCCESS_STATE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1;
  esclBaseline: typeof ESCL_V1_BASELINE;
  parentPack: typeof ESCL_4_ID;
  parentVersion: typeof LIFECYCLE_REVIEW_VERSION;
  parentBaseline: typeof ESCL3_LIFECYCLE_ACTION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerSuccessStateRecord[];
  recordCount: number;
  healthyCount: number;
  adoptingCount: number;
  growingCount: number;
  attentionCount: number;
  riskCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  lifecycleReviewFingerprint: string;
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

let cached: CustomerSuccessState | null = null;

function cloneState(row: CustomerSuccessState): CustomerSuccessState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerSuccessState, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    esclBaseline: row.esclBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    healthyCount: row.healthyCount,
    adoptingCount: row.adoptingCount,
    growingCount: row.growingCount,
    attentionCount: row.attentionCount,
    riskCount: row.riskCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    lifecycleReviewFingerprint: row.lifecycleReviewFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerSuccessState, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerSuccessStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        state: row.state,
        lifecycleState: row.lifecycleState,
        action: row.action,
        reviewStatus: row.reviewStatus,
        sourceFeedback: row.sourceFeedback,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map ESCL / ESCE signals to a read-only customer success state. */
export function customerSuccessStateFromSignals(input: {
  lifecycleState: CustomerLifecycleStateLevel;
  action: LifecycleActionKind;
  reviewStatus: LifecycleReviewStatus;
  feedback: ExecutionFeedbackStatus;
}): { state: CustomerSuccessStateLevel; reason: string } {
  if (
    input.lifecycleState === "AT_RISK" ||
    input.action === "INTERVENE" ||
    input.reviewStatus === "ACTION_REQUIRED" ||
    input.feedback === "OPEN"
  ) {
    return { state: "RISK", reason: "risk-from-escl-esce" };
  }
  if (
    input.lifecycleState === "WATCHING" ||
    input.action === "MONITOR" ||
    input.reviewStatus === "WATCH" ||
    input.feedback === "WATCH"
  ) {
    return { state: "ATTENTION", reason: "attention-from-watch" };
  }
  if (input.lifecycleState === "EXPANDING" || input.action === "PROMOTE") {
    return { state: "GROWING", reason: "growing-from-expand" };
  }
  if (input.lifecycleState === "ONBOARDING") {
    return { state: "ADOPTING", reason: "adopting-from-onboarding" };
  }
  return { state: "HEALTHY", reason: "healthy-from-stable" };
}

function projectRecord(
  rec: LifecycleReviewRecord,
  lifecycleState: CustomerLifecycleStateLevel,
  feedback: ExecutionFeedbackStatus,
): CustomerSuccessStateRecord {
  const mapped = customerSuccessStateFromSignals({
    lifecycleState,
    action: rec.action,
    reviewStatus: rec.reviewStatus,
    feedback,
  });
  const withoutFp: Omit<CustomerSuccessStateRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    state: mapped.state,
    lifecycleState,
    action: rec.action,
    reviewStatus: rec.reviewStatus,
    sourceFeedback: feedback,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromReview(review: LifecycleReview): CustomerSuccessState {
  const lifecycle = getCustomerLifecycleState();
  const feedback = getExecutionFeedback();
  const stateById = new Map(
    lifecycle.records.map((r) => [r.customerId, r.state] as const),
  );
  const feedbackById = new Map(
    feedback.records.map((r) => [r.customerId, r.feedback] as const),
  );

  const records = review.records.map((rec) =>
    projectRecord(
      rec,
      stateById.get(rec.customerId) ?? rec.toState,
      feedbackById.get(rec.customerId) ?? "CLOSED",
    ),
  );
  const healthyCount = records.filter((r) => r.state === "HEALTHY").length;
  const adoptingCount = records.filter((r) => r.state === "ADOPTING").length;
  const growingCount = records.filter((r) => r.state === "GROWING").length;
  const attentionCount = records.filter((r) => r.state === "ATTENTION").length;
  const riskCount = records.filter((r) => r.state === "RISK").length;

  const withoutFp: Omit<CustomerSuccessState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCS_1_ID,
    capability: CUSTOMER_SUCCESS_STATE_CAPABILITY,
    version: CUSTOMER_SUCCESS_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
    esclBaseline: ESCL_V1_BASELINE,
    parentPack: ESCL_4_ID,
    parentVersion: LIFECYCLE_REVIEW_VERSION,
    parentBaseline: ESCL3_LIFECYCLE_ACTION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    healthyCount,
    adoptingCount,
    growingCount,
    attentionCount,
    riskCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    lifecycleReviewFingerprint: review.fingerprint,
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

export function buildCustomerSuccessState(
  review?: LifecycleReview,
): CustomerSuccessState {
  const source = review ?? getLifecycleReview();
  const out = deriveFromReview(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getCustomerSuccessState(): CustomerSuccessState {
  if (!cached) {
    return buildCustomerSuccessState();
  }
  return cloneState(cached);
}

export function customerSuccessStateFingerprint(
  row?: CustomerSuccessState,
): string {
  const v = row ?? getCustomerSuccessState();
  return v.fingerprint;
}

export function clearCustomerSuccessState(): void {
  cached = null;
}
