/**
 * ESXP-5 — Expansion Feedback
 * Deterministic ExpansionFeedback from ESXP-4 ExpansionOutcome.
 * Baseline: esxp-4-expansion-outcome-1.
 * Read-only — no persistence / runtime side effects / CRM / billing / frozen-layer mutation.
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
import type { ExpansionOpportunityKind } from "./opportunity";
import type { ExpansionRecommendationKind } from "./recommendation";
import {
  ESXP3_EXPANSION_RECOMMENDATION_BASELINE,
  ESXP_4_ID,
  EXPANSION_OUTCOME_VERSION,
  buildExpansionOutcome,
  getExpansionOutcome,
  type ExpansionOutcome,
  type ExpansionOutcomeKind,
  type ExpansionOutcomeRecord,
} from "./outcome";
import type { ExpansionStateLevel } from "./state";

export const ESXP_5_ID = "ESXP-5" as const;
export const EXPANSION_FEEDBACK_CAPABILITY = "ExpansionFeedback" as const;
export const EXPANSION_FEEDBACK_VERSION = "esxp-5-expansion-feedback-1" as const;
export const ESXP4_EXPANSION_OUTCOME_BASELINE =
  "esxp4-expansion-outcome-v1" as const;

export const EXPANSION_FEEDBACKS = [
  "HOLD",
  "WATCH",
  "ENABLE",
  "ACCELERATE",
] as const;
export type ExpansionFeedbackKind = (typeof EXPANSION_FEEDBACKS)[number];

export type ExpansionFeedbackRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: ExpansionStateLevel;
  opportunity: ExpansionOpportunityKind;
  recommendation: ExpansionRecommendationKind;
  outcome: ExpansionOutcomeKind;
  feedback: ExpansionFeedbackKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ExpansionFeedback = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESXP_5_ID;
  capability: typeof EXPANSION_FEEDBACK_CAPABILITY;
  version: typeof EXPANSION_FEEDBACK_VERSION;
  baselineTag: typeof ESXP4_EXPANSION_OUTCOME_BASELINE;
  parentPack: typeof ESXP_4_ID;
  parentVersion: typeof EXPANSION_OUTCOME_VERSION;
  parentBaseline: typeof ESXP3_EXPANSION_RECOMMENDATION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly ExpansionFeedbackRecord[];
  recordCount: number;
  holdCount: number;
  watchCount: number;
  enableCount: number;
  accelerateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  expansionOutcomeFingerprint: string;
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

let cached: ExpansionFeedback | null = null;

function cloneFeedback(row: ExpansionFeedback): ExpansionFeedback {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<ExpansionFeedback, "fingerprint">): string {
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
    watchCount: row.watchCount,
    enableCount: row.enableCount,
    accelerateCount: row.accelerateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    expansionOutcomeFingerprint: row.expansionOutcomeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ExpansionFeedback, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<ExpansionFeedbackRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        opportunity: row.opportunity,
        recommendation: row.recommendation,
        outcome: row.outcome,
        feedback: row.feedback,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map expansion outcome to a read-only feedback. */
export function expansionFeedbackFromOutcome(
  outcome: ExpansionOutcomeKind,
): { feedback: ExpansionFeedbackKind; reason: string } {
  if (outcome === "IN_PROGRESS") {
    return { feedback: "ACCELERATE", reason: "accelerate-from-in-progress" };
  }
  if (outcome === "READY") {
    return { feedback: "ENABLE", reason: "enable-from-ready" };
  }
  if (outcome === "OBSERVING") {
    return { feedback: "WATCH", reason: "watch-from-observing" };
  }
  return { feedback: "HOLD", reason: "hold-from-deferred" };
}

function projectRecord(rec: ExpansionOutcomeRecord): ExpansionFeedbackRecord {
  const mapped = expansionFeedbackFromOutcome(rec.outcome);
  const withoutFp: Omit<ExpansionFeedbackRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    opportunity: rec.opportunity,
    recommendation: rec.recommendation,
    outcome: rec.outcome,
    feedback: mapped.feedback,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromOutcome(outcome: ExpansionOutcome): ExpansionFeedback {
  const records = outcome.records.map(projectRecord);
  const withoutFp: Omit<ExpansionFeedback, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESXP_5_ID,
    capability: EXPANSION_FEEDBACK_CAPABILITY,
    version: EXPANSION_FEEDBACK_VERSION,
    baselineTag: ESXP4_EXPANSION_OUTCOME_BASELINE,
    parentPack: ESXP_4_ID,
    parentVersion: EXPANSION_OUTCOME_VERSION,
    parentBaseline: ESXP3_EXPANSION_RECOMMENDATION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.feedback === "HOLD").length,
    watchCount: records.filter((r) => r.feedback === "WATCH").length,
    enableCount: records.filter((r) => r.feedback === "ENABLE").length,
    accelerateCount: records.filter((r) => r.feedback === "ACCELERATE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    expansionOutcomeFingerprint: outcome.fingerprint,
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

export function buildExpansionFeedback(
  outcome?: ExpansionOutcome,
): ExpansionFeedback {
  const source = outcome ?? getExpansionOutcome();
  const out = deriveFromOutcome(source);
  cached = cloneFeedback(out);
  return cloneFeedback(cached);
}

export function getExpansionFeedback(): ExpansionFeedback {
  if (!cached) {
    return buildExpansionFeedback();
  }
  return cloneFeedback(cached);
}

export function expansionFeedbackFingerprint(row?: ExpansionFeedback): string {
  const v = row ?? getExpansionFeedback();
  return v.fingerprint;
}

export function clearExpansionFeedback(): void {
  cached = null;
}

export function ensureOutcomeThenBuildExpansionFeedback(): ExpansionFeedback {
  buildExpansionOutcome();
  clearExpansionFeedback();
  return buildExpansionFeedback();
}
