/**
 * ESRN-1 — Renewal State
 * Deterministic RenewalState from existing ESXP expansion outputs.
 * Baseline: enterprise-saas-customer-expansion-operations-v1.
 * Read-only — no persistence / runtime side effects / CRM / billing / contract / payment / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1,
  ESXP4_EXPANSION_OUTCOME_BASELINE,
  ESXP_6_ID,
  ESXP_FREEZE_VERSION,
  getExpansionFeedback,
  getEsxpFreeze,
  type ExpansionFeedback,
  type ExpansionFeedbackKind,
  type ExpansionFeedbackRecord,
  type ExpansionOpportunityKind,
  type ExpansionOutcomeKind,
  type ExpansionRecommendationKind,
  type ExpansionStateLevel,
} from "../expansion";
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

export const ESRN_1_ID = "ESRN-1" as const;
export const RENEWAL_STATE_CAPABILITY = "RenewalState" as const;
export const RENEWAL_STATE_VERSION = "esrn-1-renewal-state-1" as const;
export const ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1 =
  "enterprise-saas-customer-expansion-operations-v1" as const;
export const ESXP_V1_BASELINE = ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1;

export const RENEWAL_STATES = [
  "NOT_READY",
  "READY",
  "RENEWING",
  "BLOCKED",
] as const;
export type RenewalStateLevel = (typeof RENEWAL_STATES)[number];

export type RenewalStateRecord = Readonly<{
  customerId: string;
  tenantId: string;
  state: RenewalStateLevel;
  expansionState: ExpansionStateLevel;
  opportunity: ExpansionOpportunityKind;
  recommendation: ExpansionRecommendationKind;
  outcome: ExpansionOutcomeKind;
  expansionFeedback: ExpansionFeedbackKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type RenewalState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESRN_1_ID;
  capability: typeof RENEWAL_STATE_CAPABILITY;
  version: typeof RENEWAL_STATE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1;
  esxpBaseline: typeof ESXP_V1_BASELINE;
  parentPack: typeof ESXP_6_ID;
  parentVersion: typeof ESXP_FREEZE_VERSION;
  parentBaseline: typeof ESXP4_EXPANSION_OUTCOME_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly RenewalStateRecord[];
  recordCount: number;
  notReadyCount: number;
  readyCount: number;
  renewingCount: number;
  blockedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  expansionFeedbackFingerprint: string;
  esxpFreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
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

let cached: RenewalState | null = null;

function cloneState(row: RenewalState): RenewalState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<RenewalState, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    esxpBaseline: row.esxpBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    notReadyCount: row.notReadyCount,
    readyCount: row.readyCount,
    renewingCount: row.renewingCount,
    blockedCount: row.blockedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    expansionFeedbackFingerprint: row.expansionFeedbackFingerprint,
    esxpFreezeFingerprint: row.esxpFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<RenewalState, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<RenewalStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        state: row.state,
        expansionState: row.expansionState,
        opportunity: row.opportunity,
        recommendation: row.recommendation,
        outcome: row.outcome,
        expansionFeedback: row.expansionFeedback,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map ESXP signals to a read-only renewal state. */
export function renewalStateFromSignals(input: {
  expansionState: ExpansionStateLevel;
  opportunity: ExpansionOpportunityKind;
  recommendation: ExpansionRecommendationKind;
  outcome: ExpansionOutcomeKind;
  feedback: ExpansionFeedbackKind;
}): { state: RenewalStateLevel; reason: string } {
  if (
    input.expansionState === "BLOCKED" ||
    input.opportunity === "NONE" ||
    input.recommendation === "HOLD" ||
    input.outcome === "DEFERRED" ||
    input.feedback === "HOLD"
  ) {
    return { state: "BLOCKED", reason: "blocked-from-esxp" };
  }
  if (
    input.expansionState === "EXPANDING" ||
    input.opportunity === "ACTIVE" ||
    input.recommendation === "PURSUE" ||
    input.outcome === "IN_PROGRESS" ||
    input.feedback === "ACCELERATE"
  ) {
    return { state: "RENEWING", reason: "renewing-from-esxp" };
  }
  if (
    input.expansionState === "READY" ||
    input.opportunity === "QUALIFIED" ||
    input.recommendation === "PREPARE" ||
    input.outcome === "READY" ||
    input.feedback === "ENABLE"
  ) {
    return { state: "READY", reason: "ready-from-esxp" };
  }
  return { state: "NOT_READY", reason: "not-ready-from-esxp" };
}

function projectRecord(rec: ExpansionFeedbackRecord): RenewalStateRecord {
  const mapped = renewalStateFromSignals({
    expansionState: rec.fromState,
    opportunity: rec.opportunity,
    recommendation: rec.recommendation,
    outcome: rec.outcome,
    feedback: rec.feedback,
  });
  const withoutFp: Omit<RenewalStateRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    state: mapped.state,
    expansionState: rec.fromState,
    opportunity: rec.opportunity,
    recommendation: rec.recommendation,
    outcome: rec.outcome,
    expansionFeedback: rec.feedback,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromFeedback(feedback: ExpansionFeedback): RenewalState {
  const freeze = getEsxpFreeze();
  const records = feedback.records.map(projectRecord);

  const withoutFp: Omit<RenewalState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESRN_1_ID,
    capability: RENEWAL_STATE_CAPABILITY,
    version: RENEWAL_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1,
    esxpBaseline: ESXP_V1_BASELINE,
    parentPack: ESXP_6_ID,
    parentVersion: ESXP_FREEZE_VERSION,
    parentBaseline: ESXP4_EXPANSION_OUTCOME_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    notReadyCount: records.filter((r) => r.state === "NOT_READY").length,
    readyCount: records.filter((r) => r.state === "READY").length,
    renewingCount: records.filter((r) => r.state === "RENEWING").length,
    blockedCount: records.filter((r) => r.state === "BLOCKED").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    expansionFeedbackFingerprint: feedback.fingerprint,
    esxpFreezeFingerprint: freeze.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
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

export function buildRenewalState(feedback?: ExpansionFeedback): RenewalState {
  const source = feedback ?? getExpansionFeedback();
  const out = deriveFromFeedback(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getRenewalState(): RenewalState {
  if (!cached) {
    return buildRenewalState();
  }
  return cloneState(cached);
}

export function renewalStateFingerprint(row?: RenewalState): string {
  const v = row ?? getRenewalState();
  return v.fingerprint;
}

export function clearRenewalState(): void {
  cached = null;
}
