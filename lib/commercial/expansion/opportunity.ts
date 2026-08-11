/**
 * ESXP-2 — Expansion Opportunity
 * Deterministic ExpansionOpportunity from ESXP-1 ExpansionState.
 * Baseline: esxp-1-expansion-state-1.
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
  ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
  ESXP_1_ID,
  EXPANSION_STATE_VERSION,
  buildExpansionState,
  getExpansionState,
  type ExpansionState,
  type ExpansionStateLevel,
  type ExpansionStateRecord,
} from "./state";

export const ESXP_2_ID = "ESXP-2" as const;
export const EXPANSION_OPPORTUNITY_CAPABILITY = "ExpansionOpportunity" as const;
export const EXPANSION_OPPORTUNITY_VERSION =
  "esxp-2-expansion-opportunity-1" as const;
export const ESXP1_EXPANSION_STATE_BASELINE =
  "esxp1-expansion-state-v1" as const;

export const EXPANSION_OPPORTUNITIES = [
  "NONE",
  "WATCH",
  "QUALIFIED",
  "ACTIVE",
] as const;
export type ExpansionOpportunityKind =
  (typeof EXPANSION_OPPORTUNITIES)[number];

export type ExpansionOpportunityRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: ExpansionStateLevel;
  opportunity: ExpansionOpportunityKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ExpansionOpportunity = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESXP_2_ID;
  capability: typeof EXPANSION_OPPORTUNITY_CAPABILITY;
  version: typeof EXPANSION_OPPORTUNITY_VERSION;
  baselineTag: typeof ESXP1_EXPANSION_STATE_BASELINE;
  parentPack: typeof ESXP_1_ID;
  parentVersion: typeof EXPANSION_STATE_VERSION;
  parentBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly ExpansionOpportunityRecord[];
  recordCount: number;
  noneCount: number;
  watchCount: number;
  qualifiedCount: number;
  activeCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  expansionStateFingerprint: string;
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

let cached: ExpansionOpportunity | null = null;

function cloneOpportunity(row: ExpansionOpportunity): ExpansionOpportunity {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ExpansionOpportunity, "fingerprint">,
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
    noneCount: row.noneCount,
    watchCount: row.watchCount,
    qualifiedCount: row.qualifiedCount,
    activeCount: row.activeCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    expansionStateFingerprint: row.expansionStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ExpansionOpportunity, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<ExpansionOpportunityRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        opportunity: row.opportunity,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map expansion state to a read-only opportunity. */
export function expansionOpportunityFromState(
  state: ExpansionStateLevel,
): { opportunity: ExpansionOpportunityKind; reason: string } {
  if (state === "EXPANDING") {
    return { opportunity: "ACTIVE", reason: "active-from-expanding" };
  }
  if (state === "READY") {
    return { opportunity: "QUALIFIED", reason: "qualified-from-ready" };
  }
  if (state === "NOT_READY") {
    return { opportunity: "WATCH", reason: "watch-from-not-ready" };
  }
  return { opportunity: "NONE", reason: "none-from-blocked" };
}

function projectRecord(
  rec: ExpansionStateRecord,
): ExpansionOpportunityRecord {
  const mapped = expansionOpportunityFromState(rec.state);
  const withoutFp: Omit<ExpansionOpportunityRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.state,
    opportunity: mapped.opportunity,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromState(state: ExpansionState): ExpansionOpportunity {
  const records = state.records.map(projectRecord);
  const withoutFp: Omit<ExpansionOpportunity, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESXP_2_ID,
    capability: EXPANSION_OPPORTUNITY_CAPABILITY,
    version: EXPANSION_OPPORTUNITY_VERSION,
    baselineTag: ESXP1_EXPANSION_STATE_BASELINE,
    parentPack: ESXP_1_ID,
    parentVersion: EXPANSION_STATE_VERSION,
    parentBaseline: ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    noneCount: records.filter((r) => r.opportunity === "NONE").length,
    watchCount: records.filter((r) => r.opportunity === "WATCH").length,
    qualifiedCount: records.filter((r) => r.opportunity === "QUALIFIED").length,
    activeCount: records.filter((r) => r.opportunity === "ACTIVE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    expansionStateFingerprint: state.fingerprint,
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

export function buildExpansionOpportunity(
  state?: ExpansionState,
): ExpansionOpportunity {
  const source = state ?? getExpansionState();
  const out = deriveFromState(source);
  cached = cloneOpportunity(out);
  return cloneOpportunity(cached);
}

export function getExpansionOpportunity(): ExpansionOpportunity {
  if (!cached) {
    return buildExpansionOpportunity();
  }
  return cloneOpportunity(cached);
}

export function expansionOpportunityFingerprint(
  row?: ExpansionOpportunity,
): string {
  const v = row ?? getExpansionOpportunity();
  return v.fingerprint;
}

export function clearExpansionOpportunity(): void {
  cached = null;
}

export function ensureStateThenBuildExpansionOpportunity(): ExpansionOpportunity {
  buildExpansionState();
  clearExpansionOpportunity();
  return buildExpansionOpportunity();
}
