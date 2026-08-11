/**
 * ESCP-2 — Customer Plan Action
 * Deterministic CustomerPlanAction from ESCP-1 CustomerPlanState.
 * Baseline: escp-1-customer-plan-state-1.
 * Recommendation / planning only — no execution / orchestration / persistence / CRM / billing / frozen-layer mutation.
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
  CUSTOMER_PLAN_STATE_VERSION,
  ESCP_1_ID,
  ESCI_V1_BASELINE,
  buildCustomerPlanState,
  getCustomerPlanState,
  type CustomerPlanPriority,
  type CustomerPlanState,
  type CustomerPlanStateRecord,
  type CustomerPlanStatus,
} from "./customer-plan-state";

export const ESCP_2_ID = "ESCP-2" as const;
export const CUSTOMER_PLAN_ACTION_CAPABILITY = "CustomerPlanAction" as const;
export const CUSTOMER_PLAN_ACTION_VERSION =
  "escp-2-customer-plan-action-1" as const;
export const ESCP1_CUSTOMER_PLAN_STATE_BASELINE =
  "escp1-customer-plan-state-v1" as const;

export const CUSTOMER_PLAN_ACTIONS = [
  "HOLD",
  "WATCH",
  "PREPARE",
  "REMEDIATE",
] as const;
export type CustomerPlanActionKind = (typeof CUSTOMER_PLAN_ACTIONS)[number];

export type CustomerPlanActionRecord = Readonly<{
  actionId: string;
  planId: string;
  customerId: string;
  tenantId: string;
  fromStatus: CustomerPlanStatus;
  action: CustomerPlanActionKind;
  priority: CustomerPlanPriority;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerPlanAction = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCP_2_ID;
  capability: typeof CUSTOMER_PLAN_ACTION_CAPABILITY;
  version: typeof CUSTOMER_PLAN_ACTION_VERSION;
  baselineTag: typeof ESCP1_CUSTOMER_PLAN_STATE_BASELINE;
  parentPack: typeof ESCP_1_ID;
  parentVersion: typeof CUSTOMER_PLAN_STATE_VERSION;
  parentBaseline: typeof ESCI_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerPlanActionRecord[];
  recordCount: number;
  holdCount: number;
  watchCount: number;
  prepareCount: number;
  remediateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerPlanStateFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    recommendationOnly: true;
    planningOnly: true;
    noExecution: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noMarketingExecution: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
    noEsciMutation: true;
    noEscaMutation: true;
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

let cached: CustomerPlanAction | null = null;

function cloneAction(row: CustomerPlanAction): CustomerPlanAction {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<CustomerPlanAction, "fingerprint">): string {
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
    prepareCount: row.prepareCount,
    remediateCount: row.remediateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerPlanStateFingerprint: row.customerPlanStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerPlanAction, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerPlanActionRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        actionId: row.actionId,
        planId: row.planId,
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromStatus: row.fromStatus,
        action: row.action,
        priority: row.priority,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stableActionId(tenantId: string, customerId: string): string {
  return `escp-2:${tenantId}:${customerId}`;
}

/** Map customer plan status to a read-only planning action. */
export function customerPlanActionFromState(status: CustomerPlanStatus): {
  action: CustomerPlanActionKind;
  priority: CustomerPlanPriority;
  reason: string;
} {
  if (status === "BLOCKED") {
    return {
      action: "REMEDIATE",
      priority: "P1",
      reason: "remediate-from-blocked",
    };
  }
  if (status === "PLANNING") {
    return {
      action: "PREPARE",
      priority: "P2",
      reason: "prepare-from-planning",
    };
  }
  if (status === "NOT_READY") {
    return {
      action: "WATCH",
      priority: "P3",
      reason: "watch-from-not-ready",
    };
  }
  return {
    action: "HOLD",
    priority: "P4",
    reason: "hold-from-ready",
  };
}

function projectRecord(rec: CustomerPlanStateRecord): CustomerPlanActionRecord {
  const mapped = customerPlanActionFromState(rec.status);
  const withoutFp: Omit<CustomerPlanActionRecord, "fingerprint"> = {
    actionId: stableActionId(rec.tenantId, rec.customerId),
    planId: rec.planId,
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromStatus: rec.status,
    action: mapped.action,
    priority: mapped.priority,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromState(state: CustomerPlanState): CustomerPlanAction {
  const records = state.records.map(projectRecord);
  const withoutFp: Omit<CustomerPlanAction, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCP_2_ID,
    capability: CUSTOMER_PLAN_ACTION_CAPABILITY,
    version: CUSTOMER_PLAN_ACTION_VERSION,
    baselineTag: ESCP1_CUSTOMER_PLAN_STATE_BASELINE,
    parentPack: ESCP_1_ID,
    parentVersion: CUSTOMER_PLAN_STATE_VERSION,
    parentBaseline: ESCI_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.action === "HOLD").length,
    watchCount: records.filter((r) => r.action === "WATCH").length,
    prepareCount: records.filter((r) => r.action === "PREPARE").length,
    remediateCount: records.filter((r) => r.action === "REMEDIATE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerPlanStateFingerprint: state.fingerprint,
    scope: {
      readOnly: true,
      recommendationOnly: true,
      planningOnly: true,
      noExecution: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEsciMutation: true,
      noEscaMutation: true,
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

export function buildCustomerPlanAction(
  state?: CustomerPlanState,
): CustomerPlanAction {
  const source = state ?? getCustomerPlanState();
  const out = deriveFromState(source);
  cached = cloneAction(out);
  return cloneAction(cached);
}

export function getCustomerPlanAction(): CustomerPlanAction {
  if (!cached) {
    return buildCustomerPlanAction();
  }
  return cloneAction(cached);
}

export function customerPlanActionFingerprint(
  row?: CustomerPlanAction,
): string {
  const v = row ?? getCustomerPlanAction();
  return v.fingerprint;
}

export function clearCustomerPlanAction(): void {
  cached = null;
}

export function ensureStateThenBuildCustomerPlanAction(): CustomerPlanAction {
  buildCustomerPlanState();
  clearCustomerPlanAction();
  return buildCustomerPlanAction();
}
