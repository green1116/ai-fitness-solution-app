/**
 * ESCA-2 — Advocacy Readiness
 * Deterministic AdvocacyReadiness from ESCA-1 AdvocacyState.
 * Baseline: esca-1-advocacy-state-1.
 * Read-only — no persistence / runtime side effects / CRM / marketing / contract / payment / billing / frozen-layer mutation.
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
  ADVOCACY_STATE_VERSION,
  ESCA_1_ID,
  ESRN_V1_BASELINE,
  buildAdvocacyState,
  getAdvocacyState,
  type AdvocacyState,
  type AdvocacyStateLevel,
  type AdvocacyStateRecord,
} from "./advocacy-state";

export const ESCA_2_ID = "ESCA-2" as const;
export const ADVOCACY_READINESS_CAPABILITY = "AdvocacyReadiness" as const;
export const ADVOCACY_READINESS_VERSION = "esca-2-advocacy-readiness-1" as const;
export const ESCA1_ADVOCACY_STATE_BASELINE = "esca1-advocacy-state-v1" as const;

export const ADVOCACY_READINESSES = [
  "NONE",
  "WATCH",
  "ELIGIBLE",
  "ACTIVE",
] as const;
export type AdvocacyReadinessKind = (typeof ADVOCACY_READINESSES)[number];

export type AdvocacyReadinessRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: AdvocacyStateLevel;
  readiness: AdvocacyReadinessKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type AdvocacyReadiness = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCA_2_ID;
  capability: typeof ADVOCACY_READINESS_CAPABILITY;
  version: typeof ADVOCACY_READINESS_VERSION;
  baselineTag: typeof ESCA1_ADVOCACY_STATE_BASELINE;
  parentPack: typeof ESCA_1_ID;
  parentVersion: typeof ADVOCACY_STATE_VERSION;
  parentBaseline: typeof ESRN_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly AdvocacyReadinessRecord[];
  recordCount: number;
  noneCount: number;
  watchCount: number;
  eligibleCount: number;
  activeCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  advocacyStateFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noMarketingExecution: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
    noEsrnMutation: true;
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

let cached: AdvocacyReadiness | null = null;

function cloneReadiness(row: AdvocacyReadiness): AdvocacyReadiness {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<AdvocacyReadiness, "fingerprint">): string {
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
    advocacyStateFingerprint: row.advocacyStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<AdvocacyReadiness, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<AdvocacyReadinessRecord, "fingerprint">,
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

/** Map advocacy state to a read-only readiness. */
export function advocacyReadinessFromState(
  state: AdvocacyStateLevel,
): { readiness: AdvocacyReadinessKind; reason: string } {
  if (state === "ADVOCATING") {
    return { readiness: "ACTIVE", reason: "active-from-advocating" };
  }
  if (state === "READY") {
    return { readiness: "ELIGIBLE", reason: "eligible-from-ready" };
  }
  if (state === "NOT_READY") {
    return { readiness: "WATCH", reason: "watch-from-not-ready" };
  }
  return { readiness: "NONE", reason: "none-from-blocked" };
}

function projectRecord(rec: AdvocacyStateRecord): AdvocacyReadinessRecord {
  const mapped = advocacyReadinessFromState(rec.state);
  const withoutFp: Omit<AdvocacyReadinessRecord, "fingerprint"> = {
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

function deriveFromState(state: AdvocacyState): AdvocacyReadiness {
  const records = state.records.map(projectRecord);
  const withoutFp: Omit<AdvocacyReadiness, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCA_2_ID,
    capability: ADVOCACY_READINESS_CAPABILITY,
    version: ADVOCACY_READINESS_VERSION,
    baselineTag: ESCA1_ADVOCACY_STATE_BASELINE,
    parentPack: ESCA_1_ID,
    parentVersion: ADVOCACY_STATE_VERSION,
    parentBaseline: ESRN_V1_BASELINE,
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
    advocacyStateFingerprint: state.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEsrnMutation: true,
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

export function buildAdvocacyReadiness(
  state?: AdvocacyState,
): AdvocacyReadiness {
  const source = state ?? getAdvocacyState();
  const out = deriveFromState(source);
  cached = cloneReadiness(out);
  return cloneReadiness(cached);
}

export function getAdvocacyReadiness(): AdvocacyReadiness {
  if (!cached) {
    return buildAdvocacyReadiness();
  }
  return cloneReadiness(cached);
}

export function advocacyReadinessFingerprint(
  row?: AdvocacyReadiness,
): string {
  const v = row ?? getAdvocacyReadiness();
  return v.fingerprint;
}

export function clearAdvocacyReadiness(): void {
  cached = null;
}

export function ensureStateThenBuildAdvocacyReadiness(): AdvocacyReadiness {
  buildAdvocacyState();
  clearAdvocacyReadiness();
  return buildAdvocacyReadiness();
}
