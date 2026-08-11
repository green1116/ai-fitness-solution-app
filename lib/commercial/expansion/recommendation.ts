/**
 * ESXP-3 — Expansion Recommendation
 * Deterministic ExpansionRecommendation from ESXP-2 ExpansionOpportunity.
 * Baseline: esxp-2-expansion-opportunity-1.
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
import {
  ESXP1_EXPANSION_STATE_BASELINE,
  ESXP_2_ID,
  EXPANSION_OPPORTUNITY_VERSION,
  buildExpansionOpportunity,
  getExpansionOpportunity,
  type ExpansionOpportunity,
  type ExpansionOpportunityKind,
  type ExpansionOpportunityRecord,
} from "./opportunity";
import type { ExpansionStateLevel } from "./state";

export const ESXP_3_ID = "ESXP-3" as const;
export const EXPANSION_RECOMMENDATION_CAPABILITY =
  "ExpansionRecommendation" as const;
export const EXPANSION_RECOMMENDATION_VERSION =
  "esxp-3-expansion-recommendation-1" as const;
export const ESXP2_EXPANSION_OPPORTUNITY_BASELINE =
  "esxp2-expansion-opportunity-v1" as const;

export const EXPANSION_RECOMMENDATIONS = [
  "HOLD",
  "MONITOR",
  "PREPARE",
  "PURSUE",
] as const;
export type ExpansionRecommendationKind =
  (typeof EXPANSION_RECOMMENDATIONS)[number];

export type ExpansionRecommendationRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: ExpansionStateLevel;
  opportunity: ExpansionOpportunityKind;
  recommendation: ExpansionRecommendationKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ExpansionRecommendation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESXP_3_ID;
  capability: typeof EXPANSION_RECOMMENDATION_CAPABILITY;
  version: typeof EXPANSION_RECOMMENDATION_VERSION;
  baselineTag: typeof ESXP2_EXPANSION_OPPORTUNITY_BASELINE;
  parentPack: typeof ESXP_2_ID;
  parentVersion: typeof EXPANSION_OPPORTUNITY_VERSION;
  parentBaseline: typeof ESXP1_EXPANSION_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly ExpansionRecommendationRecord[];
  recordCount: number;
  holdCount: number;
  monitorCount: number;
  prepareCount: number;
  pursueCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  expansionOpportunityFingerprint: string;
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

let cached: ExpansionRecommendation | null = null;

function cloneRecommendation(
  row: ExpansionRecommendation,
): ExpansionRecommendation {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ExpansionRecommendation, "fingerprint">,
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
    holdCount: row.holdCount,
    monitorCount: row.monitorCount,
    prepareCount: row.prepareCount,
    pursueCount: row.pursueCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    expansionOpportunityFingerprint: row.expansionOpportunityFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ExpansionRecommendation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<ExpansionRecommendationRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        opportunity: row.opportunity,
        recommendation: row.recommendation,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map expansion opportunity to a read-only recommendation. */
export function expansionRecommendationFromOpportunity(
  opportunity: ExpansionOpportunityKind,
): { recommendation: ExpansionRecommendationKind; reason: string } {
  if (opportunity === "ACTIVE") {
    return { recommendation: "PURSUE", reason: "pursue-from-active" };
  }
  if (opportunity === "QUALIFIED") {
    return { recommendation: "PREPARE", reason: "prepare-from-qualified" };
  }
  if (opportunity === "WATCH") {
    return { recommendation: "MONITOR", reason: "monitor-from-watch" };
  }
  return { recommendation: "HOLD", reason: "hold-from-none" };
}

function projectRecord(
  rec: ExpansionOpportunityRecord,
): ExpansionRecommendationRecord {
  const mapped = expansionRecommendationFromOpportunity(rec.opportunity);
  const withoutFp: Omit<ExpansionRecommendationRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    opportunity: rec.opportunity,
    recommendation: mapped.recommendation,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromOpportunity(
  opportunity: ExpansionOpportunity,
): ExpansionRecommendation {
  const records = opportunity.records.map(projectRecord);
  const withoutFp: Omit<ExpansionRecommendation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESXP_3_ID,
    capability: EXPANSION_RECOMMENDATION_CAPABILITY,
    version: EXPANSION_RECOMMENDATION_VERSION,
    baselineTag: ESXP2_EXPANSION_OPPORTUNITY_BASELINE,
    parentPack: ESXP_2_ID,
    parentVersion: EXPANSION_OPPORTUNITY_VERSION,
    parentBaseline: ESXP1_EXPANSION_STATE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.recommendation === "HOLD").length,
    monitorCount: records.filter((r) => r.recommendation === "MONITOR").length,
    prepareCount: records.filter((r) => r.recommendation === "PREPARE").length,
    pursueCount: records.filter((r) => r.recommendation === "PURSUE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    expansionOpportunityFingerprint: opportunity.fingerprint,
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

export function buildExpansionRecommendation(
  opportunity?: ExpansionOpportunity,
): ExpansionRecommendation {
  const source = opportunity ?? getExpansionOpportunity();
  const out = deriveFromOpportunity(source);
  cached = cloneRecommendation(out);
  return cloneRecommendation(cached);
}

export function getExpansionRecommendation(): ExpansionRecommendation {
  if (!cached) {
    return buildExpansionRecommendation();
  }
  return cloneRecommendation(cached);
}

export function expansionRecommendationFingerprint(
  row?: ExpansionRecommendation,
): string {
  const v = row ?? getExpansionRecommendation();
  return v.fingerprint;
}

export function clearExpansionRecommendation(): void {
  cached = null;
}

export function ensureOpportunityThenBuildExpansionRecommendation(): ExpansionRecommendation {
  buildExpansionOpportunity();
  clearExpansionRecommendation();
  return buildExpansionRecommendation();
}
