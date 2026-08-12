/**
 * EWA-1 — Workspace Action Projection
 * Deterministic read-only WorkspaceAction from frozen ESOS / EPI / PEX / WFX.
 * Baseline: enterprise-saas-workflow-experience-v1.
 * No persistence / Prisma / new engine / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getOperationsSurface,
  type OperationsSurface,
} from "../operations-surface";
import {
  getProductIntelligenceView,
  type ProductIntelligenceView,
} from "../../product/intelligence";
import {
  ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1,
  getWfxFreeze,
} from "../../workflow/experience";
import type {
  OperatingDecisionKind,
  OperatingQueueStatus,
} from "../production-ops";

export const EWA_1_ID = "EWA-1" as const;
export const WORKSPACE_ACTION_CAPABILITY = "WorkspaceAction" as const;
export const WORKSPACE_ACTION_VERSION = "ewa-1-workspace-action-1" as const;

export const WORKSPACE_ACTION_TYPES = [
  "REVIEW",
  "PREPARE",
  "MONITOR",
  "HOLD",
] as const;
export type WorkspaceActionType = (typeof WORKSPACE_ACTION_TYPES)[number];

export const WORKSPACE_ACTION_STATUSES = [
  "OPEN",
  "QUEUED",
  "WATCH",
  "HELD",
] as const;
export type WorkspaceActionStatus = (typeof WORKSPACE_ACTION_STATUSES)[number];

const STATUS_RANK: Readonly<Record<WorkspaceActionStatus, number>> = {
  OPEN: 0,
  QUEUED: 1,
  WATCH: 2,
  HELD: 3,
};

export type WorkspaceAction = Readonly<{
  id: string;
  customerId: string;
  actionType: WorkspaceActionType;
  status: WorkspaceActionStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type WorkspaceActions = Readonly<{
  workPackageId: typeof EWA_1_ID;
  capability: typeof WORKSPACE_ACTION_CAPABILITY;
  version: typeof WORKSPACE_ACTION_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1;
  parentPack: "WFX-Freeze";
  records: readonly WorkspaceAction[];
  recordCount: number;
  openCount: number;
  queuedCount: number;
  watchCount: number;
  heldCount: number;
  reviewCount: number;
  prepareCount: number;
  monitorCount: number;
  holdCount: number;
  operationsSurfaceFingerprint: string;
  productIntelligenceFingerprint: string;
  wfxFreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    viewOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noPrisma: true;
    noFrozenLayerChanges: true;
  };
}>;

let cached: WorkspaceActions | null = null;

function clonePack(row: WorkspaceActions): WorkspaceActions {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function actionTypeFromDecision(
  decision: OperatingDecisionKind,
): WorkspaceActionType {
  if (decision === "ACT") return "REVIEW";
  if (decision === "PREPARE") return "PREPARE";
  if (decision === "WATCH") return "MONITOR";
  return "HOLD";
}

function statusFromQueue(status: OperatingQueueStatus): WorkspaceActionStatus {
  return status;
}

function recordFingerprint(
  row: Omit<WorkspaceAction, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        customerId: row.customerId,
        actionType: row.actionType,
        status: row.status,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePayload(row: Omit<WorkspaceActions, "fingerprint">): string {
  return JSON.stringify({
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    records: row.records,
    recordCount: row.recordCount,
    openCount: row.openCount,
    queuedCount: row.queuedCount,
    watchCount: row.watchCount,
    heldCount: row.heldCount,
    reviewCount: row.reviewCount,
    prepareCount: row.prepareCount,
    monitorCount: row.monitorCount,
    holdCount: row.holdCount,
    operationsSurfaceFingerprint: row.operationsSurfaceFingerprint,
    productIntelligenceFingerprint: row.productIntelligenceFingerprint,
    wfxFreezeFingerprint: row.wfxFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<WorkspaceActions, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveActions(
  surface: OperationsSurface,
  view: ProductIntelligenceView,
): WorkspaceActions {
  const wfx = getWfxFreeze();
  const decisionByCustomer = new Map(
    surface.decisions.map((d) => [d.customerId, d] as const),
  );
  const projected = surface.queue.map((item) => {
    const decision = decisionByCustomer.get(item.customerId);
    const actionType = actionTypeFromDecision(decision?.decision ?? "HOLD");
    const status = statusFromQueue(item.status);
    const base = {
      id: `ewa-1:${item.customerId}`,
      customerId: item.customerId,
      actionType,
      status,
      reason: `workspace-${actionType.toLowerCase()}-from-${status.toLowerCase()}`,
      ordinal: 0,
    };
    return base;
  });
  const sorted = [...projected].sort((a, b) => {
    const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (byStatus !== 0) return byStatus;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records: WorkspaceAction[] = sorted.map((row, ordinal) => {
    const withoutFp = { ...row, ordinal };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const withoutFp: Omit<WorkspaceActions, "fingerprint"> = {
    workPackageId: EWA_1_ID,
    capability: WORKSPACE_ACTION_CAPABILITY,
    version: WORKSPACE_ACTION_VERSION,
    baselineTag: ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1,
    parentPack: "WFX-Freeze",
    records,
    recordCount: records.length,
    openCount: records.filter((r) => r.status === "OPEN").length,
    queuedCount: records.filter((r) => r.status === "QUEUED").length,
    watchCount: records.filter((r) => r.status === "WATCH").length,
    heldCount: records.filter((r) => r.status === "HELD").length,
    reviewCount: records.filter((r) => r.actionType === "REVIEW").length,
    prepareCount: records.filter((r) => r.actionType === "PREPARE").length,
    monitorCount: records.filter((r) => r.actionType === "MONITOR").length,
    holdCount: records.filter((r) => r.actionType === "HOLD").length,
    operationsSurfaceFingerprint: surface.fingerprint,
    productIntelligenceFingerprint: view.fingerprint,
    wfxFreezeFingerprint: wfx.fingerprint,
    scope: {
      readOnly: true,
      viewOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noPrisma: true,
      noFrozenLayerChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildWorkspaceActions(): WorkspaceActions {
  const out = deriveActions(
    getOperationsSurface(),
    getProductIntelligenceView(),
  );
  cached = clonePack(out);
  return clonePack(cached);
}

export function getWorkspaceActions(): WorkspaceActions {
  if (!cached) {
    return buildWorkspaceActions();
  }
  return clonePack(cached);
}

export function clearWorkspaceActions(): void {
  cached = null;
}
