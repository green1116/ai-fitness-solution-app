/**
 * ESPO-1 — Commercial Operating Queue
 * Deterministic operator queue from existing ESCP plan / action outputs.
 * Baseline: enterprise-saas-customer-planning-operations-v1.
 * Read-only — no persistence / execution / orchestration / CRM / billing / contract / payment / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1,
  ESCP2_CUSTOMER_PLAN_ACTION_BASELINE,
  ESCP_FREEZE_ID,
  ESCP_FREEZE_VERSION,
  getCustomerPlanAction,
  getCustomerPlanState,
  getEscpFreeze,
  type CustomerPlanAction,
  type CustomerPlanActionKind,
  type CustomerPlanActionRecord,
  type CustomerPlanPriority,
  type CustomerPlanStatus,
} from "../planning";
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

export const ESPO_1_ID = "ESPO-1" as const;
export const OPERATING_QUEUE_CAPABILITY = "CommercialOperatingQueue" as const;
export const OPERATING_QUEUE_VERSION = "espo-1-operating-queue-1" as const;
export const ESCP_V1_BASELINE = ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1;

export const OPERATING_QUEUE_STATUSES = [
  "OPEN",
  "QUEUED",
  "WATCH",
  "HELD",
] as const;
export type OperatingQueueStatus = (typeof OPERATING_QUEUE_STATUSES)[number];

const PRIORITY_RANK: Readonly<Record<CustomerPlanPriority, number>> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

export type OperatingQueueItem = Readonly<{
  id: string;
  customerId: string;
  planId: string;
  actionId: string;
  priority: CustomerPlanPriority;
  status: OperatingQueueStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type OperatingQueue = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESPO_1_ID;
  capability: typeof OPERATING_QUEUE_CAPABILITY;
  version: typeof OPERATING_QUEUE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1;
  escpBaseline: typeof ESCP_V1_BASELINE;
  parentPack: typeof ESCP_FREEZE_ID;
  parentVersion: typeof ESCP_FREEZE_VERSION;
  parentBaseline: typeof ESCP2_CUSTOMER_PLAN_ACTION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly OperatingQueueItem[];
  recordCount: number;
  openCount: number;
  queuedCount: number;
  watchCount: number;
  heldCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerPlanActionFingerprint: string;
  customerPlanStateFingerprint: string;
  escpFreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noMarketingExecution: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
    noEscpMutation: true;
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

let cached: OperatingQueue | null = null;

function cloneQueue(row: OperatingQueue): OperatingQueue {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<OperatingQueue, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    escpBaseline: row.escpBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    openCount: row.openCount,
    queuedCount: row.queuedCount,
    watchCount: row.watchCount,
    heldCount: row.heldCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerPlanActionFingerprint: row.customerPlanActionFingerprint,
    customerPlanStateFingerprint: row.customerPlanStateFingerprint,
    escpFreezeFingerprint: row.escpFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<OperatingQueue, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<OperatingQueueItem, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        customerId: row.customerId,
        planId: row.planId,
        actionId: row.actionId,
        priority: row.priority,
        status: row.status,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stableQueueId(tenantId: string, customerId: string): string {
  return `espo-1:${tenantId}:${customerId}`;
}

/** Map ESCP plan / action signals to a read-only queue status. */
export function operatingQueueFromSignals(input: {
  action: CustomerPlanActionKind;
  status: CustomerPlanStatus;
  priority: CustomerPlanPriority;
}): { status: OperatingQueueStatus; reason: string } {
  if (
    input.action === "REMEDIATE" ||
    input.status === "BLOCKED" ||
    input.priority === "P1"
  ) {
    return { status: "OPEN", reason: "open-from-remediate" };
  }
  if (
    input.action === "PREPARE" ||
    input.status === "PLANNING" ||
    input.priority === "P2"
  ) {
    return { status: "QUEUED", reason: "queued-from-prepare" };
  }
  if (
    input.action === "WATCH" ||
    input.status === "NOT_READY" ||
    input.priority === "P3"
  ) {
    return { status: "WATCH", reason: "watch-from-not-ready" };
  }
  return { status: "HELD", reason: "held-from-hold" };
}

function projectItem(
  rec: CustomerPlanActionRecord,
  status: CustomerPlanStatus,
): Omit<OperatingQueueItem, "fingerprint" | "ordinal"> {
  const mapped = operatingQueueFromSignals({
    action: rec.action,
    status,
    priority: rec.priority,
  });
  return {
    id: stableQueueId(rec.tenantId, rec.customerId),
    customerId: rec.customerId,
    planId: rec.planId,
    actionId: rec.actionId,
    priority: rec.priority,
    status: mapped.status,
    reason: mapped.reason,
  };
}

function deriveFromAction(action: CustomerPlanAction): OperatingQueue {
  const statePack = getCustomerPlanState();
  const freeze = getEscpFreeze();
  const statusById = new Map(
    statePack.records.map((r) => [r.customerId, r.status] as const),
  );
  const projected = action.records.map((rec) =>
    projectItem(rec, statusById.get(rec.customerId) ?? rec.fromStatus),
  );
  const sorted = [...projected].sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records = sorted.map((row, i) => {
    const withoutFp: Omit<OperatingQueueItem, "fingerprint"> = {
      ...row,
      ordinal: i + 1,
    };
    return {
      ...withoutFp,
      fingerprint: recordFingerprint(withoutFp),
    };
  });

  const withoutFp: Omit<OperatingQueue, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESPO_1_ID,
    capability: OPERATING_QUEUE_CAPABILITY,
    version: OPERATING_QUEUE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1,
    escpBaseline: ESCP_V1_BASELINE,
    parentPack: ESCP_FREEZE_ID,
    parentVersion: ESCP_FREEZE_VERSION,
    parentBaseline: ESCP2_CUSTOMER_PLAN_ACTION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    openCount: records.filter((r) => r.status === "OPEN").length,
    queuedCount: records.filter((r) => r.status === "QUEUED").length,
    watchCount: records.filter((r) => r.status === "WATCH").length,
    heldCount: records.filter((r) => r.status === "HELD").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerPlanActionFingerprint: action.fingerprint,
    customerPlanStateFingerprint: statePack.fingerprint,
    escpFreezeFingerprint: freeze.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEscpMutation: true,
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

export function buildOperatingQueue(
  action?: CustomerPlanAction,
): OperatingQueue {
  const source = action ?? getCustomerPlanAction();
  const out = deriveFromAction(source);
  cached = cloneQueue(out);
  return cloneQueue(cached);
}

export function getOperatingQueue(): OperatingQueue {
  if (!cached) {
    return buildOperatingQueue();
  }
  return cloneQueue(cached);
}

export function operatingQueueFingerprint(row?: OperatingQueue): string {
  const v = row ?? getOperatingQueue();
  return v.fingerprint;
}

export function clearOperatingQueue(): void {
  cached = null;
}
