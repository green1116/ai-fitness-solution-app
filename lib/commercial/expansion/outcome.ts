/**
 * ESXP-4 — Expansion Outcome
 * Deterministic ExpansionOutcome from ESXP-3 ExpansionRecommendation.
 * Baseline: esxp-3-expansion-recommendation-1.
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
import {
  ESXP2_EXPANSION_OPPORTUNITY_BASELINE,
  ESXP_3_ID,
  EXPANSION_RECOMMENDATION_VERSION,
  buildExpansionRecommendation,
  getExpansionRecommendation,
  type ExpansionRecommendation,
  type ExpansionRecommendationKind,
  type ExpansionRecommendationRecord,
} from "./recommendation";
import type { ExpansionStateLevel } from "./state";

export const ESXP_4_ID = "ESXP-4" as const;
export const EXPANSION_OUTCOME_CAPABILITY = "ExpansionOutcome" as const;
export const EXPANSION_OUTCOME_VERSION = "esxp-4-expansion-outcome-1" as const;
export const ESXP3_EXPANSION_RECOMMENDATION_BASELINE =
  "esxp3-expansion-recommendation-v1" as const;

export const EXPANSION_OUTCOMES = [
  "DEFERRED",
  "OBSERVING",
  "READY",
  "IN_PROGRESS",
] as const;
export type ExpansionOutcomeKind = (typeof EXPANSION_OUTCOMES)[number];

export type ExpansionOutcomeRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: ExpansionStateLevel;
  opportunity: ExpansionOpportunityKind;
  recommendation: ExpansionRecommendationKind;
  outcome: ExpansionOutcomeKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ExpansionOutcome = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESXP_4_ID;
  capability: typeof EXPANSION_OUTCOME_CAPABILITY;
  version: typeof EXPANSION_OUTCOME_VERSION;
  baselineTag: typeof ESXP3_EXPANSION_RECOMMENDATION_BASELINE;
  parentPack: typeof ESXP_3_ID;
  parentVersion: typeof EXPANSION_RECOMMENDATION_VERSION;
  parentBaseline: typeof ESXP2_EXPANSION_OPPORTUNITY_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly ExpansionOutcomeRecord[];
  recordCount: number;
  deferredCount: number;
  observingCount: number;
  readyCount: number;
  inProgressCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  expansionRecommendationFingerprint: string;
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

let cached: ExpansionOutcome | null = null;

function cloneOutcome(row: ExpansionOutcome): ExpansionOutcome {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<ExpansionOutcome, "fingerprint">): string {
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
    observingCount: row.observingCount,
    readyCount: row.readyCount,
    inProgressCount: row.inProgressCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    expansionRecommendationFingerprint: row.expansionRecommendationFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ExpansionOutcome, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<ExpansionOutcomeRecord, "fingerprint">,
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
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map expansion recommendation to a read-only outcome. */
export function expansionOutcomeFromRecommendation(
  recommendation: ExpansionRecommendationKind,
): { outcome: ExpansionOutcomeKind; reason: string } {
  if (recommendation === "PURSUE") {
    return { outcome: "IN_PROGRESS", reason: "in-progress-from-pursue" };
  }
  if (recommendation === "PREPARE") {
    return { outcome: "READY", reason: "ready-from-prepare" };
  }
  if (recommendation === "MONITOR") {
    return { outcome: "OBSERVING", reason: "observing-from-monitor" };
  }
  return { outcome: "DEFERRED", reason: "deferred-from-hold" };
}

function projectRecord(
  rec: ExpansionRecommendationRecord,
): ExpansionOutcomeRecord {
  const mapped = expansionOutcomeFromRecommendation(rec.recommendation);
  const withoutFp: Omit<ExpansionOutcomeRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    opportunity: rec.opportunity,
    recommendation: rec.recommendation,
    outcome: mapped.outcome,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromRecommendation(
  recommendation: ExpansionRecommendation,
): ExpansionOutcome {
  const records = recommendation.records.map(projectRecord);
  const withoutFp: Omit<ExpansionOutcome, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESXP_4_ID,
    capability: EXPANSION_OUTCOME_CAPABILITY,
    version: EXPANSION_OUTCOME_VERSION,
    baselineTag: ESXP3_EXPANSION_RECOMMENDATION_BASELINE,
    parentPack: ESXP_3_ID,
    parentVersion: EXPANSION_RECOMMENDATION_VERSION,
    parentBaseline: ESXP2_EXPANSION_OPPORTUNITY_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    deferredCount: records.filter((r) => r.outcome === "DEFERRED").length,
    observingCount: records.filter((r) => r.outcome === "OBSERVING").length,
    readyCount: records.filter((r) => r.outcome === "READY").length,
    inProgressCount: records.filter((r) => r.outcome === "IN_PROGRESS").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    expansionRecommendationFingerprint: recommendation.fingerprint,
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

export function buildExpansionOutcome(
  recommendation?: ExpansionRecommendation,
): ExpansionOutcome {
  const source = recommendation ?? getExpansionRecommendation();
  const out = deriveFromRecommendation(source);
  cached = cloneOutcome(out);
  return cloneOutcome(cached);
}

export function getExpansionOutcome(): ExpansionOutcome {
  if (!cached) {
    return buildExpansionOutcome();
  }
  return cloneOutcome(cached);
}

export function expansionOutcomeFingerprint(row?: ExpansionOutcome): string {
  const v = row ?? getExpansionOutcome();
  return v.fingerprint;
}

export function clearExpansionOutcome(): void {
  cached = null;
}

export function ensureRecommendationThenBuildExpansionOutcome(): ExpansionOutcome {
  buildExpansionRecommendation();
  clearExpansionOutcome();
  return buildExpansionOutcome();
}
