/**
 * ESCS-3 — Customer Success Outcome
 * Deterministic CustomerSuccessOutcome from ESCS-1 state + ESCS-2 intervention.
 * Baseline: escs2-customer-success-intervention-v1.
 * Read-only — no persistence / runtime side effects / CRM / billing / ESCL / ESCE mutation.
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
import { getCustomerSuccessState, type CustomerSuccessStateLevel } from "./customer-success-state";
import {
  ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE,
  ESCS_2_ID,
  CUSTOMER_SUCCESS_INTERVENTION_VERSION,
  buildCustomerSuccessIntervention,
  getCustomerSuccessIntervention,
  type CustomerSuccessIntervention,
  type CustomerSuccessInterventionKind,
  type CustomerSuccessInterventionRecord,
} from "./customer-success-intervention";

export const ESCS_3_ID = "ESCS-3" as const;
export const CUSTOMER_SUCCESS_OUTCOME_CAPABILITY =
  "CustomerSuccessOutcome" as const;
export const CUSTOMER_SUCCESS_OUTCOME_VERSION =
  "escs-3-customer-success-outcome-1" as const;
export const ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE =
  "escs2-customer-success-intervention-v1" as const;

export const CUSTOMER_SUCCESS_OUTCOMES = [
  "SUSTAIN",
  "ADOPT",
  "GROW",
  "STABILIZE",
  "RECOVER",
] as const;
export type CustomerSuccessOutcomeKind =
  (typeof CUSTOMER_SUCCESS_OUTCOMES)[number];

export type CustomerSuccessOutcomeRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: CustomerSuccessStateLevel;
  intervention: CustomerSuccessInterventionKind;
  outcome: CustomerSuccessOutcomeKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerSuccessOutcome = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCS_3_ID;
  capability: typeof CUSTOMER_SUCCESS_OUTCOME_CAPABILITY;
  version: typeof CUSTOMER_SUCCESS_OUTCOME_VERSION;
  baselineTag: typeof ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE;
  parentPack: typeof ESCS_2_ID;
  parentVersion: typeof CUSTOMER_SUCCESS_INTERVENTION_VERSION;
  parentBaseline: typeof ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerSuccessOutcomeRecord[];
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
  customerSuccessInterventionFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: CustomerSuccessOutcome | null = null;

function cloneOutcome(row: CustomerSuccessOutcome): CustomerSuccessOutcome {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerSuccessOutcome, "fingerprint">,
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
    sustainCount: row.sustainCount,
    adoptCount: row.adoptCount,
    growCount: row.growCount,
    stabilizeCount: row.stabilizeCount,
    recoverCount: row.recoverCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerSuccessInterventionFingerprint:
      row.customerSuccessInterventionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerSuccessOutcome, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerSuccessOutcomeRecord, "fingerprint">,
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

/** Map intervention to a read-only success outcome. */
export function customerSuccessOutcomeFromIntervention(
  intervention: CustomerSuccessInterventionKind,
): { outcome: CustomerSuccessOutcomeKind; reason: string } {
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
  rec: CustomerSuccessInterventionRecord,
): CustomerSuccessOutcomeRecord {
  const mapped = customerSuccessOutcomeFromIntervention(rec.intervention);
  const withoutFp: Omit<CustomerSuccessOutcomeRecord, "fingerprint"> = {
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
  intervention: CustomerSuccessIntervention,
): CustomerSuccessOutcome {
  const stateById = new Map(
    getCustomerSuccessState().records.map((r) => [r.customerId, r] as const),
  );
  const records = intervention.records.map((rec) => {
    const projected = projectRecord(rec);
    const sourceState = stateById.get(rec.customerId);
    if (!sourceState || sourceState.state === projected.fromState) {
      return projected;
    }
    const withoutFp: Omit<CustomerSuccessOutcomeRecord, "fingerprint"> = {
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

  const withoutFp: Omit<CustomerSuccessOutcome, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCS_3_ID,
    capability: CUSTOMER_SUCCESS_OUTCOME_CAPABILITY,
    version: CUSTOMER_SUCCESS_OUTCOME_VERSION,
    baselineTag: ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE,
    parentPack: ESCS_2_ID,
    parentVersion: CUSTOMER_SUCCESS_INTERVENTION_VERSION,
    parentBaseline: ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE,
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
    customerSuccessInterventionFingerprint: intervention.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
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

export function buildCustomerSuccessOutcome(
  intervention?: CustomerSuccessIntervention,
): CustomerSuccessOutcome {
  const source = intervention ?? getCustomerSuccessIntervention();
  const out = deriveFromIntervention(source);
  cached = cloneOutcome(out);
  return cloneOutcome(cached);
}

export function getCustomerSuccessOutcome(): CustomerSuccessOutcome {
  if (!cached) {
    return buildCustomerSuccessOutcome();
  }
  return cloneOutcome(cached);
}

export function customerSuccessOutcomeFingerprint(
  row?: CustomerSuccessOutcome,
): string {
  const v = row ?? getCustomerSuccessOutcome();
  return v.fingerprint;
}

export function clearCustomerSuccessOutcome(): void {
  cached = null;
}

export function ensureInterventionThenBuildCustomerSuccessOutcome(): CustomerSuccessOutcome {
  buildCustomerSuccessIntervention();
  clearCustomerSuccessOutcome();
  return buildCustomerSuccessOutcome();
}
