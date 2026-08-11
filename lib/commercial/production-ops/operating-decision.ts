/**
 * ESPO-2 — Operating Decision
 * Deterministic OperatingDecision from ESPO-1 Commercial Operating Queue.
 * Baseline: espo-1-operating-queue-1.
 * Read-only — no persistence / external execution / CRM / billing / frozen-layer mutation.
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
  ESCP_V1_BASELINE,
  ESPO_1_ID,
  OPERATING_QUEUE_VERSION,
  buildOperatingQueue,
  getOperatingQueue,
  type OperatingQueue,
  type OperatingQueueItem,
  type OperatingQueueStatus,
} from "./operating-queue";
import type { CustomerPlanPriority } from "../planning";

export const ESPO_2_ID = "ESPO-2" as const;
export const OPERATING_DECISION_CAPABILITY = "OperatingDecision" as const;
export const OPERATING_DECISION_VERSION =
  "espo-2-operating-decision-1" as const;
export const ESPO1_OPERATING_QUEUE_BASELINE =
  "espo1-operating-queue-v1" as const;

export const OPERATING_DECISIONS = [
  "HOLD",
  "WATCH",
  "PREPARE",
  "ACT",
] as const;
export type OperatingDecisionKind = (typeof OPERATING_DECISIONS)[number];

export type OperatingDecisionRecord = Readonly<{
  id: string;
  itemId: string;
  customerId: string;
  decision: OperatingDecisionKind;
  priority: CustomerPlanPriority;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type OperatingDecision = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESPO_2_ID;
  capability: typeof OPERATING_DECISION_CAPABILITY;
  version: typeof OPERATING_DECISION_VERSION;
  baselineTag: typeof ESPO1_OPERATING_QUEUE_BASELINE;
  parentPack: typeof ESPO_1_ID;
  parentVersion: typeof OPERATING_QUEUE_VERSION;
  parentBaseline: typeof ESCP_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly OperatingDecisionRecord[];
  recordCount: number;
  holdCount: number;
  watchCount: number;
  prepareCount: number;
  actCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  operatingQueueFingerprint: string;
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

let cached: OperatingDecision | null = null;

function cloneDecision(row: OperatingDecision): OperatingDecision {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<OperatingDecision, "fingerprint">): string {
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
    actCount: row.actCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    operatingQueueFingerprint: row.operatingQueueFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<OperatingDecision, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<OperatingDecisionRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        itemId: row.itemId,
        customerId: row.customerId,
        decision: row.decision,
        priority: row.priority,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stableDecisionId(itemId: string): string {
  return itemId.replace(/^espo-1:/, "espo-2:");
}

/** Map operating queue status to a read-only operator decision. */
export function operatingDecisionFromQueue(status: OperatingQueueStatus): {
  decision: OperatingDecisionKind;
  reason: string;
} {
  if (status === "OPEN") {
    return { decision: "ACT", reason: "act-from-open" };
  }
  if (status === "QUEUED") {
    return { decision: "PREPARE", reason: "prepare-from-queued" };
  }
  if (status === "WATCH") {
    return { decision: "WATCH", reason: "watch-from-watch" };
  }
  return { decision: "HOLD", reason: "hold-from-held" };
}

function projectRecord(rec: OperatingQueueItem): OperatingDecisionRecord {
  const mapped = operatingDecisionFromQueue(rec.status);
  const withoutFp: Omit<OperatingDecisionRecord, "fingerprint"> = {
    id: stableDecisionId(rec.id),
    itemId: rec.id,
    customerId: rec.customerId,
    decision: mapped.decision,
    priority: rec.priority,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromQueue(queue: OperatingQueue): OperatingDecision {
  const records = queue.records.map(projectRecord);
  const withoutFp: Omit<OperatingDecision, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESPO_2_ID,
    capability: OPERATING_DECISION_CAPABILITY,
    version: OPERATING_DECISION_VERSION,
    baselineTag: ESPO1_OPERATING_QUEUE_BASELINE,
    parentPack: ESPO_1_ID,
    parentVersion: OPERATING_QUEUE_VERSION,
    parentBaseline: ESCP_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.decision === "HOLD").length,
    watchCount: records.filter((r) => r.decision === "WATCH").length,
    prepareCount: records.filter((r) => r.decision === "PREPARE").length,
    actCount: records.filter((r) => r.decision === "ACT").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    operatingQueueFingerprint: queue.fingerprint,
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

export function buildOperatingDecision(
  queue?: OperatingQueue,
): OperatingDecision {
  const source = queue ?? getOperatingQueue();
  const out = deriveFromQueue(source);
  cached = cloneDecision(out);
  return cloneDecision(cached);
}

export function getOperatingDecision(): OperatingDecision {
  if (!cached) {
    return buildOperatingDecision();
  }
  return cloneDecision(cached);
}

export function operatingDecisionFingerprint(
  row?: OperatingDecision,
): string {
  const v = row ?? getOperatingDecision();
  return v.fingerprint;
}

export function clearOperatingDecision(): void {
  cached = null;
}

export function ensureQueueThenBuildOperatingDecision(): OperatingDecision {
  buildOperatingQueue();
  clearOperatingDecision();
  return buildOperatingDecision();
}
