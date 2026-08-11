/**
 * ESCR-3 — Retention Outcome
 * Deterministic RetentionOutcome from ESCR-1 state + ESCR-2 intervention.
 * Baseline: escr2-retention-intervention-v1.
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
import { getRetentionState, type RetentionStateLevel } from "./retention-state";
import {
  ESCR1_RETENTION_STATE_BASELINE,
  ESCR_2_ID,
  RETENTION_INTERVENTION_VERSION,
  buildRetentionIntervention,
  getRetentionIntervention,
  type RetentionIntervention,
  type RetentionInterventionKind,
  type RetentionInterventionRecord,
} from "./retention-intervention";

export const ESCR_3_ID = "ESCR-3" as const;
export const RETENTION_OUTCOME_CAPABILITY = "RetentionOutcome" as const;
export const RETENTION_OUTCOME_VERSION = "escr-3-retention-outcome-1" as const;
export const ESCR2_RETENTION_INTERVENTION_BASELINE =
  "escr2-retention-intervention-v1" as const;

export const RETENTION_OUTCOMES = [
  "SUSTAIN",
  "ADOPT",
  "GROW",
  "STABILIZE",
  "RECOVER",
] as const;
export type RetentionOutcomeKind = (typeof RETENTION_OUTCOMES)[number];

export type RetentionOutcomeRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: RetentionStateLevel;
  intervention: RetentionInterventionKind;
  outcome: RetentionOutcomeKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type RetentionOutcome = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCR_3_ID;
  capability: typeof RETENTION_OUTCOME_CAPABILITY;
  version: typeof RETENTION_OUTCOME_VERSION;
  baselineTag: typeof ESCR2_RETENTION_INTERVENTION_BASELINE;
  parentPack: typeof ESCR_2_ID;
  parentVersion: typeof RETENTION_INTERVENTION_VERSION;
  parentBaseline: typeof ESCR1_RETENTION_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly RetentionOutcomeRecord[];
  recordCount: number;
  sustainCount: number;
  adoptCount: number;
  growCount: number;
  stabilizeCount: number;
  recoverCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  retentionInterventionFingerprint: string;
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

let cached: RetentionOutcome | null = null;

function cloneOutcome(row: RetentionOutcome): RetentionOutcome {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<RetentionOutcome, "fingerprint">): string {
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
    sustainCount: row.sustainCount,
    adoptCount: row.adoptCount,
    growCount: row.growCount,
    stabilizeCount: row.stabilizeCount,
    recoverCount: row.recoverCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    retentionInterventionFingerprint: row.retentionInterventionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RetentionOutcome, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<RetentionOutcomeRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        intervention: row.intervention,
        outcome: row.outcome,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map retention intervention to a read-only outcome. */
export function retentionOutcomeFromIntervention(
  intervention: RetentionInterventionKind,
): { outcome: RetentionOutcomeKind; reason: string } {
  if (intervention === "INTERVENE") {
    return { outcome: "RECOVER", reason: "recover-from-intervene" };
  }
  if (intervention === "ASSIST") {
    return { outcome: "STABILIZE", reason: "stabilize-from-assist" };
  }
  if (intervention === "ENABLE") {
    return { outcome: "GROW", reason: "grow-from-enable" };
  }
  if (intervention === "GUIDE") {
    return { outcome: "ADOPT", reason: "adopt-from-guide" };
  }
  return { outcome: "SUSTAIN", reason: "sustain-from-hold" };
}

function projectRecord(
  rec: RetentionInterventionRecord,
): RetentionOutcomeRecord {
  const mapped = retentionOutcomeFromIntervention(rec.intervention);
  const withoutFp: Omit<RetentionOutcomeRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    intervention: rec.intervention,
    outcome: mapped.outcome,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromIntervention(
  intervention: RetentionIntervention,
): RetentionOutcome {
  const stateById = new Map(
    getRetentionState().records.map((r) => [r.customerId, r] as const),
  );
  const records = intervention.records.map((rec) => {
    const projected = projectRecord(rec);
    const sourceState = stateById.get(rec.customerId);
    if (!sourceState || sourceState.state === projected.fromState) {
      return projected;
    }
    const withoutFp: Omit<RetentionOutcomeRecord, "fingerprint"> = {
      customerId: projected.customerId,
      tenantId: projected.tenantId,
      fromState: sourceState.state,
      intervention: projected.intervention,
      outcome: projected.outcome,
      reason: projected.reason,
      ordinal: projected.ordinal,
    };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const sustainCount = records.filter((r) => r.outcome === "SUSTAIN").length;
  const adoptCount = records.filter((r) => r.outcome === "ADOPT").length;
  const growCount = records.filter((r) => r.outcome === "GROW").length;
  const stabilizeCount = records.filter((r) => r.outcome === "STABILIZE")
    .length;
  const recoverCount = records.filter((r) => r.outcome === "RECOVER").length;

  const withoutFp: Omit<RetentionOutcome, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCR_3_ID,
    capability: RETENTION_OUTCOME_CAPABILITY,
    version: RETENTION_OUTCOME_VERSION,
    baselineTag: ESCR2_RETENTION_INTERVENTION_BASELINE,
    parentPack: ESCR_2_ID,
    parentVersion: RETENTION_INTERVENTION_VERSION,
    parentBaseline: ESCR1_RETENTION_STATE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    sustainCount,
    adoptCount,
    growCount,
    stabilizeCount,
    recoverCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    retentionInterventionFingerprint: intervention.fingerprint,
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

export function buildRetentionOutcome(
  intervention?: RetentionIntervention,
): RetentionOutcome {
  const source = intervention ?? getRetentionIntervention();
  const out = deriveFromIntervention(source);
  cached = cloneOutcome(out);
  return cloneOutcome(cached);
}

export function getRetentionOutcome(): RetentionOutcome {
  if (!cached) {
    return buildRetentionOutcome();
  }
  return cloneOutcome(cached);
}

export function retentionOutcomeFingerprint(row?: RetentionOutcome): string {
  const v = row ?? getRetentionOutcome();
  return v.fingerprint;
}

export function clearRetentionOutcome(): void {
  cached = null;
}

export function ensureInterventionThenBuildRetentionOutcome(): RetentionOutcome {
  buildRetentionIntervention();
  clearRetentionOutcome();
  return buildRetentionOutcome();
}
