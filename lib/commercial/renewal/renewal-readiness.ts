/**
 * ESRN-2 — Renewal Readiness
 * Deterministic RenewalReadiness from ESRN-1 RenewalState.
 * Baseline: esrn-1-renewal-state-1.
 * Read-only — no persistence / runtime side effects / CRM / billing / contract / payment / frozen-layer mutation.
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
  ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1,
  ESRN_1_ID,
  RENEWAL_STATE_VERSION,
  buildRenewalState,
  getRenewalState,
  type RenewalState,
  type RenewalStateLevel,
  type RenewalStateRecord,
} from "./renewal-state";

export const ESRN_2_ID = "ESRN-2" as const;
export const RENEWAL_READINESS_CAPABILITY = "RenewalReadiness" as const;
export const RENEWAL_READINESS_VERSION = "esrn-2-renewal-readiness-1" as const;
export const ESRN1_RENEWAL_STATE_BASELINE = "esrn1-renewal-state-v1" as const;

export const RENEWAL_READINESSES = [
  "NONE",
  "WATCH",
  "ELIGIBLE",
  "ACTIVE",
] as const;
export type RenewalReadinessKind = (typeof RENEWAL_READINESSES)[number];

export type RenewalReadinessRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: RenewalStateLevel;
  readiness: RenewalReadinessKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type RenewalReadiness = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESRN_2_ID;
  capability: typeof RENEWAL_READINESS_CAPABILITY;
  version: typeof RENEWAL_READINESS_VERSION;
  baselineTag: typeof ESRN1_RENEWAL_STATE_BASELINE;
  parentPack: typeof ESRN_1_ID;
  parentVersion: typeof RENEWAL_STATE_VERSION;
  parentBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly RenewalReadinessRecord[];
  recordCount: number;
  noneCount: number;
  watchCount: number;
  eligibleCount: number;
  activeCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  renewalStateFingerprint: string;
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

let cached: RenewalReadiness | null = null;

function cloneReadiness(row: RenewalReadiness): RenewalReadiness {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<RenewalReadiness, "fingerprint">): string {
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
    eligibleCount: row.eligibleCount,
    activeCount: row.activeCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    renewalStateFingerprint: row.renewalStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RenewalReadiness, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<RenewalReadinessRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        readiness: row.readiness,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map renewal state to a read-only readiness. */
export function renewalReadinessFromState(
  state: RenewalStateLevel,
): { readiness: RenewalReadinessKind; reason: string } {
  if (state === "RENEWING") {
    return { readiness: "ACTIVE", reason: "active-from-renewing" };
  }
  if (state === "READY") {
    return { readiness: "ELIGIBLE", reason: "eligible-from-ready" };
  }
  if (state === "NOT_READY") {
    return { readiness: "WATCH", reason: "watch-from-not-ready" };
  }
  return { readiness: "NONE", reason: "none-from-blocked" };
}

function projectRecord(rec: RenewalStateRecord): RenewalReadinessRecord {
  const mapped = renewalReadinessFromState(rec.state);
  const withoutFp: Omit<RenewalReadinessRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.state,
    readiness: mapped.readiness,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromState(state: RenewalState): RenewalReadiness {
  const records = state.records.map(projectRecord);
  const withoutFp: Omit<RenewalReadiness, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESRN_2_ID,
    capability: RENEWAL_READINESS_CAPABILITY,
    version: RENEWAL_READINESS_VERSION,
    baselineTag: ESRN1_RENEWAL_STATE_BASELINE,
    parentPack: ESRN_1_ID,
    parentVersion: RENEWAL_STATE_VERSION,
    parentBaseline: ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    noneCount: records.filter((r) => r.readiness === "NONE").length,
    watchCount: records.filter((r) => r.readiness === "WATCH").length,
    eligibleCount: records.filter((r) => r.readiness === "ELIGIBLE").length,
    activeCount: records.filter((r) => r.readiness === "ACTIVE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    renewalStateFingerprint: state.fingerprint,
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

export function buildRenewalReadiness(
  state?: RenewalState,
): RenewalReadiness {
  const source = state ?? getRenewalState();
  const out = deriveFromState(source);
  cached = cloneReadiness(out);
  return cloneReadiness(cached);
}

export function getRenewalReadiness(): RenewalReadiness {
  if (!cached) {
    return buildRenewalReadiness();
  }
  return cloneReadiness(cached);
}

export function renewalReadinessFingerprint(
  row?: RenewalReadiness,
): string {
  const v = row ?? getRenewalReadiness();
  return v.fingerprint;
}

export function clearRenewalReadiness(): void {
  cached = null;
}

export function ensureStateThenBuildRenewalReadiness(): RenewalReadiness {
  buildRenewalState();
  clearRenewalReadiness();
  return buildRenewalReadiness();
}
