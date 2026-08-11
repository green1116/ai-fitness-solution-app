/**
 * ESCR-2 — Retention Intervention
 * Deterministic RetentionIntervention from ESCR-1 RetentionState.
 * Baseline: escr1-retention-state-v1.
 * Read-only — no persistence / runtime side effects / CRM / billing / ESCS / ESCL / ESCE mutation.
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
  ESCR_1_ID,
  ESCS_V1_BASELINE,
  RETENTION_STATE_VERSION,
  buildRetentionState,
  getRetentionState,
  type RetentionState,
  type RetentionStateLevel,
  type RetentionStateRecord,
} from "./retention-state";

export const ESCR_2_ID = "ESCR-2" as const;
export const RETENTION_INTERVENTION_CAPABILITY =
  "RetentionIntervention" as const;
export const RETENTION_INTERVENTION_VERSION =
  "escr-2-retention-intervention-1" as const;
export const ESCR1_RETENTION_STATE_BASELINE = "escr1-retention-state-v1" as const;

export const RETENTION_INTERVENTIONS = [
  "HOLD",
  "GUIDE",
  "ENABLE",
  "ASSIST",
  "INTERVENE",
] as const;
export type RetentionInterventionKind =
  (typeof RETENTION_INTERVENTIONS)[number];

export type RetentionInterventionRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: RetentionStateLevel;
  intervention: RetentionInterventionKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type RetentionIntervention = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCR_2_ID;
  capability: typeof RETENTION_INTERVENTION_CAPABILITY;
  version: typeof RETENTION_INTERVENTION_VERSION;
  baselineTag: typeof ESCR1_RETENTION_STATE_BASELINE;
  parentPack: typeof ESCR_1_ID;
  parentVersion: typeof RETENTION_STATE_VERSION;
  parentBaseline: typeof ESCS_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly RetentionInterventionRecord[];
  recordCount: number;
  holdCount: number;
  guideCount: number;
  enableCount: number;
  assistCount: number;
  interveneCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  retentionStateFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: RetentionIntervention | null = null;

function cloneIntervention(
  row: RetentionIntervention,
): RetentionIntervention {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<RetentionIntervention, "fingerprint">,
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
    guideCount: row.guideCount,
    enableCount: row.enableCount,
    assistCount: row.assistCount,
    interveneCount: row.interveneCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    retentionStateFingerprint: row.retentionStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RetentionIntervention, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<RetentionInterventionRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        intervention: row.intervention,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map retention state to a read-only intervention. */
export function retentionInterventionFromState(
  state: RetentionStateLevel,
): { intervention: RetentionInterventionKind; reason: string } {
  if (state === "RISK") {
    return { intervention: "INTERVENE", reason: "intervene-from-risk" };
  }
  if (state === "WATCH") {
    return { intervention: "ASSIST", reason: "assist-from-watch" };
  }
  if (state === "EXPAND") {
    return { intervention: "ENABLE", reason: "enable-from-expand" };
  }
  if (state === "ADOPT") {
    return { intervention: "GUIDE", reason: "guide-from-adopt" };
  }
  return { intervention: "HOLD", reason: "hold-from-secure" };
}

function projectRecord(
  rec: RetentionStateRecord,
): RetentionInterventionRecord {
  const mapped = retentionInterventionFromState(rec.state);
  const withoutFp: Omit<RetentionInterventionRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.state,
    intervention: mapped.intervention,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromState(state: RetentionState): RetentionIntervention {
  const records = state.records.map(projectRecord);
  const holdCount = records.filter((r) => r.intervention === "HOLD").length;
  const guideCount = records.filter((r) => r.intervention === "GUIDE").length;
  const enableCount = records.filter((r) => r.intervention === "ENABLE").length;
  const assistCount = records.filter((r) => r.intervention === "ASSIST").length;
  const interveneCount = records.filter(
    (r) => r.intervention === "INTERVENE",
  ).length;

  const withoutFp: Omit<RetentionIntervention, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCR_2_ID,
    capability: RETENTION_INTERVENTION_CAPABILITY,
    version: RETENTION_INTERVENTION_VERSION,
    baselineTag: ESCR1_RETENTION_STATE_BASELINE,
    parentPack: ESCR_1_ID,
    parentVersion: RETENTION_STATE_VERSION,
    parentBaseline: ESCS_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount,
    guideCount,
    enableCount,
    assistCount,
    interveneCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    retentionStateFingerprint: state.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
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

export function buildRetentionIntervention(
  state?: RetentionState,
): RetentionIntervention {
  const source = state ?? getRetentionState();
  const out = deriveFromState(source);
  cached = cloneIntervention(out);
  return cloneIntervention(cached);
}

export function getRetentionIntervention(): RetentionIntervention {
  if (!cached) {
    return buildRetentionIntervention();
  }
  return cloneIntervention(cached);
}

export function retentionInterventionFingerprint(
  row?: RetentionIntervention,
): string {
  const v = row ?? getRetentionIntervention();
  return v.fingerprint;
}

export function clearRetentionIntervention(): void {
  cached = null;
}

export function ensureStateThenBuildRetentionIntervention(): RetentionIntervention {
  buildRetentionState();
  clearRetentionIntervention();
  return buildRetentionIntervention();
}
