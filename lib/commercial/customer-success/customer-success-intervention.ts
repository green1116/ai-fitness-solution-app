/**
 * ESCS-2 — Customer Success Intervention
 * Deterministic CustomerSuccessIntervention from ESCS-1 CustomerSuccessState.
 * Baseline: escs1-customer-success-state-v1.
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
import {
  CUSTOMER_SUCCESS_STATE_VERSION,
  ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
  ESCS_1_ID,
  buildCustomerSuccessState,
  getCustomerSuccessState,
  type CustomerSuccessState,
  type CustomerSuccessStateLevel,
  type CustomerSuccessStateRecord,
} from "./customer-success-state";

export const ESCS_2_ID = "ESCS-2" as const;
export const CUSTOMER_SUCCESS_INTERVENTION_CAPABILITY =
  "CustomerSuccessIntervention" as const;
export const CUSTOMER_SUCCESS_INTERVENTION_VERSION =
  "escs-2-customer-success-intervention-1" as const;
export const ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE =
  "escs1-customer-success-state-v1" as const;

export const CUSTOMER_SUCCESS_INTERVENTIONS = [
  "HOLD",
  "GUIDE",
  "ENABLE",
  "ASSIST",
  "INTERVENE",
] as const;
export type CustomerSuccessInterventionKind =
  (typeof CUSTOMER_SUCCESS_INTERVENTIONS)[number];

export type CustomerSuccessInterventionRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: CustomerSuccessStateLevel;
  intervention: CustomerSuccessInterventionKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerSuccessIntervention = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCS_2_ID;
  capability: typeof CUSTOMER_SUCCESS_INTERVENTION_CAPABILITY;
  version: typeof CUSTOMER_SUCCESS_INTERVENTION_VERSION;
  baselineTag: typeof ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE;
  parentPack: typeof ESCS_1_ID;
  parentVersion: typeof CUSTOMER_SUCCESS_STATE_VERSION;
  parentBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerSuccessInterventionRecord[];
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
  customerSuccessStateFingerprint: string;
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

let cached: CustomerSuccessIntervention | null = null;

function cloneIntervention(
  row: CustomerSuccessIntervention,
): CustomerSuccessIntervention {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerSuccessIntervention, "fingerprint">,
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
    customerSuccessStateFingerprint: row.customerSuccessStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerSuccessIntervention, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerSuccessInterventionRecord, "fingerprint">,
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

/** Map customer success state to a read-only intervention. */
export function customerSuccessInterventionFromState(
  state: CustomerSuccessStateLevel,
): { intervention: CustomerSuccessInterventionKind; reason: string } {
  if (state === "RISK") {
    return { intervention: "INTERVENE", reason: "intervene-from-risk" };
  }
  if (state === "ATTENTION") {
    return { intervention: "ASSIST", reason: "assist-from-attention" };
  }
  if (state === "GROWING") {
    return { intervention: "ENABLE", reason: "enable-from-growing" };
  }
  if (state === "ADOPTING") {
    return { intervention: "GUIDE", reason: "guide-from-adopting" };
  }
  return { intervention: "HOLD", reason: "hold-from-healthy" };
}

function projectRecord(
  rec: CustomerSuccessStateRecord,
): CustomerSuccessInterventionRecord {
  const mapped = customerSuccessInterventionFromState(rec.state);
  const withoutFp: Omit<CustomerSuccessInterventionRecord, "fingerprint"> = {
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

function deriveFromState(
  state: CustomerSuccessState,
): CustomerSuccessIntervention {
  const records = state.records.map(projectRecord);
  const holdCount = records.filter((r) => r.intervention === "HOLD").length;
  const guideCount = records.filter((r) => r.intervention === "GUIDE").length;
  const enableCount = records.filter((r) => r.intervention === "ENABLE").length;
  const assistCount = records.filter((r) => r.intervention === "ASSIST").length;
  const interveneCount = records.filter(
    (r) => r.intervention === "INTERVENE",
  ).length;

  const withoutFp: Omit<CustomerSuccessIntervention, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCS_2_ID,
    capability: CUSTOMER_SUCCESS_INTERVENTION_CAPABILITY,
    version: CUSTOMER_SUCCESS_INTERVENTION_VERSION,
    baselineTag: ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE,
    parentPack: ESCS_1_ID,
    parentVersion: CUSTOMER_SUCCESS_STATE_VERSION,
    parentBaseline: ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
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
    customerSuccessStateFingerprint: state.fingerprint,
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

export function buildCustomerSuccessIntervention(
  state?: CustomerSuccessState,
): CustomerSuccessIntervention {
  const source = state ?? getCustomerSuccessState();
  const out = deriveFromState(source);
  cached = cloneIntervention(out);
  return cloneIntervention(cached);
}

export function getCustomerSuccessIntervention(): CustomerSuccessIntervention {
  if (!cached) {
    return buildCustomerSuccessIntervention();
  }
  return cloneIntervention(cached);
}

export function customerSuccessInterventionFingerprint(
  row?: CustomerSuccessIntervention,
): string {
  const v = row ?? getCustomerSuccessIntervention();
  return v.fingerprint;
}

export function clearCustomerSuccessIntervention(): void {
  cached = null;
}

export function ensureStateThenBuildCustomerSuccessIntervention(): CustomerSuccessIntervention {
  buildCustomerSuccessState();
  clearCustomerSuccessIntervention();
  return buildCustomerSuccessIntervention();
}
