/**
 * ESXP-1 — Expansion State
 * Deterministic ExpansionState from existing ESCR / ESCS outputs.
 * Baseline: enterprise-saas-customer-retention-operations-v1.
 * Read-only — no persistence / runtime side effects / CRM / billing / ESCR / ESCS / ESCL / ESCE mutation.
 */

import { createHash } from "node:crypto";

import {
  getCustomerSuccessState,
  type CustomerSuccessStateLevel,
} from "../customer-success";
import {
  ENTERPRISE_SAAS_CUSTOMER_RETENTION_V1,
  ESCR3_RETENTION_OUTCOME_BASELINE,
  ESCR_4_ID,
  RETENTION_REVIEW_VERSION,
  getRetentionReview,
  type RetentionInterventionKind,
  type RetentionOutcomeKind,
  type RetentionReview,
  type RetentionReviewRecord,
  type RetentionReviewStatus,
  type RetentionStateLevel,
} from "../retention";
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

export const ESXP_1_ID = "ESXP-1" as const;
export const EXPANSION_STATE_CAPABILITY = "ExpansionState" as const;
export const EXPANSION_STATE_VERSION = "esxp-1-expansion-state-1" as const;
export const ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1 =
  "enterprise-saas-customer-retention-operations-v1" as const;
export const ESCR_V1_BASELINE = ENTERPRISE_SAAS_CUSTOMER_RETENTION_V1;

export const EXPANSION_STATES = [
  "NOT_READY",
  "READY",
  "EXPANDING",
  "BLOCKED",
] as const;
export type ExpansionStateLevel = (typeof EXPANSION_STATES)[number];

export type ExpansionStateRecord = Readonly<{
  customerId: string;
  tenantId: string;
  state: ExpansionStateLevel;
  retentionState: RetentionStateLevel;
  successState: CustomerSuccessStateLevel;
  intervention: RetentionInterventionKind;
  outcome: RetentionOutcomeKind;
  reviewStatus: RetentionReviewStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ExpansionState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESXP_1_ID;
  capability: typeof EXPANSION_STATE_CAPABILITY;
  version: typeof EXPANSION_STATE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1;
  escrBaseline: typeof ESCR_V1_BASELINE;
  parentPack: typeof ESCR_4_ID;
  parentVersion: typeof RETENTION_REVIEW_VERSION;
  parentBaseline: typeof ESCR3_RETENTION_OUTCOME_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly ExpansionStateRecord[];
  recordCount: number;
  notReadyCount: number;
  readyCount: number;
  expandingCount: number;
  blockedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  retentionReviewFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
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

let cached: ExpansionState | null = null;

function cloneState(row: ExpansionState): ExpansionState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<ExpansionState, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    escrBaseline: row.escrBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    notReadyCount: row.notReadyCount,
    readyCount: row.readyCount,
    expandingCount: row.expandingCount,
    blockedCount: row.blockedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    retentionReviewFingerprint: row.retentionReviewFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ExpansionState, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<ExpansionStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        state: row.state,
        retentionState: row.retentionState,
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

/** Map ESCR / ESCS signals to a read-only expansion state. */
export function expansionStateFromSignals(input: {
  retentionState: RetentionStateLevel;
  successState: CustomerSuccessStateLevel;
  intervention: RetentionInterventionKind;
  outcome: RetentionOutcomeKind;
  reviewStatus: RetentionReviewStatus;
}): { state: ExpansionStateLevel; reason: string } {
  if (
    input.retentionState === "RISK" ||
    input.successState === "RISK" ||
    input.intervention === "INTERVENE" ||
    input.outcome === "RECOVER" ||
    input.reviewStatus === "ACTION_REQUIRED"
  ) {
    return { state: "BLOCKED", reason: "blocked-from-escr-escs" };
  }
  if (
    input.retentionState === "EXPAND" ||
    input.successState === "GROWING" ||
    input.intervention === "ENABLE" ||
    input.outcome === "GROW"
  ) {
    return { state: "EXPANDING", reason: "expanding-from-escr-escs" };
  }
  if (
    input.retentionState === "SECURE" ||
    input.successState === "HEALTHY" ||
    input.intervention === "HOLD" ||
    input.outcome === "SUSTAIN" ||
    input.reviewStatus === "STABLE"
  ) {
    return { state: "READY", reason: "ready-from-escr-escs" };
  }
  return { state: "NOT_READY", reason: "not-ready-from-escr-escs" };
}

function projectRecord(
  rec: RetentionReviewRecord,
  successState: CustomerSuccessStateLevel,
): ExpansionStateRecord {
  const mapped = expansionStateFromSignals({
    retentionState: rec.fromState,
    successState,
    intervention: rec.intervention,
    outcome: rec.outcome,
    reviewStatus: rec.reviewStatus,
  });
  const withoutFp: Omit<ExpansionStateRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    state: mapped.state,
    retentionState: rec.fromState,
    successState,
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

function deriveFromReview(review: RetentionReview): ExpansionState {
  const success = getCustomerSuccessState();
  const successById = new Map(
    success.records.map((r) => [r.customerId, r.state] as const),
  );
  const records = review.records.map((rec) =>
    projectRecord(rec, successById.get(rec.customerId) ?? "HEALTHY"),
  );

  const withoutFp: Omit<ExpansionState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESXP_1_ID,
    capability: EXPANSION_STATE_CAPABILITY,
    version: EXPANSION_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
    escrBaseline: ESCR_V1_BASELINE,
    parentPack: ESCR_4_ID,
    parentVersion: RETENTION_REVIEW_VERSION,
    parentBaseline: ESCR3_RETENTION_OUTCOME_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    notReadyCount: records.filter((r) => r.state === "NOT_READY").length,
    readyCount: records.filter((r) => r.state === "READY").length,
    expandingCount: records.filter((r) => r.state === "EXPANDING").length,
    blockedCount: records.filter((r) => r.state === "BLOCKED").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    retentionReviewFingerprint: review.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
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

export function buildExpansionState(
  review?: RetentionReview,
): ExpansionState {
  const source = review ?? getRetentionReview();
  const out = deriveFromReview(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getExpansionState(): ExpansionState {
  if (!cached) {
    return buildExpansionState();
  }
  return cloneState(cached);
}

export function expansionStateFingerprint(row?: ExpansionState): string {
  const v = row ?? getExpansionState();
  return v.fingerprint;
}

export function clearExpansionState(): void {
  cached = null;
}
