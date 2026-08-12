/**
 * EWA-2 — Action Context Mapping
 * Deterministic business-context projection from EWA-1 WorkspaceAction.
 * Baseline: ewa-1-workspace-action-1.
 * Read-only — no persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  EWA_1_ID,
  WORKSPACE_ACTION_VERSION,
  buildWorkspaceActions,
  getWorkspaceActions,
  type WorkspaceAction,
  type WorkspaceActionStatus,
  type WorkspaceActionType,
  type WorkspaceActions,
} from "./workspace-action";

export const EWA_2_ID = "EWA-2" as const;
export const WORKSPACE_ACTION_CONTEXT_CAPABILITY =
  "WorkspaceActionContext" as const;
export const WORKSPACE_ACTION_CONTEXT_VERSION =
  "ewa-2-action-context-1" as const;
export const EWA1_WORKSPACE_ACTION_BASELINE =
  "ewa1-workspace-action-v1" as const;

export const WORKSPACE_BUSINESS_CONTEXTS = [
  "COMPLIANCE",
  "DELIVERY",
  "OBSERVABILITY",
  "DEFERRED",
] as const;
export type WorkspaceBusinessContext =
  (typeof WORKSPACE_BUSINESS_CONTEXTS)[number];

export const WORKSPACE_CONTEXT_PRIORITIES = ["P1", "P2", "P3", "P4"] as const;
export type WorkspaceContextPriority =
  (typeof WORKSPACE_CONTEXT_PRIORITIES)[number];

const PRIORITY_RANK: Readonly<Record<WorkspaceContextPriority, number>> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

export type WorkspaceActionContext = Readonly<{
  id: string;
  actionId: string;
  customerId: string;
  actionType: WorkspaceActionType;
  status: WorkspaceActionStatus;
  context: WorkspaceBusinessContext;
  priority: WorkspaceContextPriority;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type WorkspaceActionContexts = Readonly<{
  workPackageId: typeof EWA_2_ID;
  capability: typeof WORKSPACE_ACTION_CONTEXT_CAPABILITY;
  version: typeof WORKSPACE_ACTION_CONTEXT_VERSION;
  baselineTag: typeof EWA1_WORKSPACE_ACTION_BASELINE;
  parentPack: typeof EWA_1_ID;
  parentVersion: typeof WORKSPACE_ACTION_VERSION;
  records: readonly WorkspaceActionContext[];
  recordCount: number;
  complianceCount: number;
  deliveryCount: number;
  observabilityCount: number;
  deferredCount: number;
  workspaceActionFingerprint: string;
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

let cached: WorkspaceActionContexts | null = null;

function clonePack(row: WorkspaceActionContexts): WorkspaceActionContexts {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function contextFromAction(
  actionType: WorkspaceActionType,
): WorkspaceBusinessContext {
  if (actionType === "REVIEW") return "COMPLIANCE";
  if (actionType === "PREPARE") return "DELIVERY";
  if (actionType === "MONITOR") return "OBSERVABILITY";
  return "DEFERRED";
}

function priorityFromStatus(
  status: WorkspaceActionStatus,
): WorkspaceContextPriority {
  if (status === "OPEN") return "P1";
  if (status === "QUEUED") return "P2";
  if (status === "WATCH") return "P3";
  return "P4";
}

function recordFingerprint(
  row: Omit<WorkspaceActionContext, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        actionId: row.actionId,
        customerId: row.customerId,
        actionType: row.actionType,
        status: row.status,
        context: row.context,
        priority: row.priority,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePayload(
  row: Omit<WorkspaceActionContexts, "fingerprint">,
): string {
  return JSON.stringify({
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    records: row.records,
    recordCount: row.recordCount,
    complianceCount: row.complianceCount,
    deliveryCount: row.deliveryCount,
    observabilityCount: row.observabilityCount,
    deferredCount: row.deferredCount,
    workspaceActionFingerprint: row.workspaceActionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<WorkspaceActionContexts, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectRecord(
  action: WorkspaceAction,
): Omit<WorkspaceActionContext, "fingerprint" | "ordinal"> {
  const context = contextFromAction(action.actionType);
  const priority = priorityFromStatus(action.status);
  return {
    id: action.id.replace(/^ewa-1:/, "ewa-2:"),
    actionId: action.id,
    customerId: action.customerId,
    actionType: action.actionType,
    status: action.status,
    context,
    priority,
    reason: `context-${context.toLowerCase()}-from-${action.actionType.toLowerCase()}`,
  };
}

function deriveContexts(actions: WorkspaceActions): WorkspaceActionContexts {
  const projected = actions.records.map(projectRecord);
  const sorted = [...projected].sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records: WorkspaceActionContext[] = sorted.map((row, ordinal) => {
    const withoutFp = { ...row, ordinal };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const withoutFp: Omit<WorkspaceActionContexts, "fingerprint"> = {
    workPackageId: EWA_2_ID,
    capability: WORKSPACE_ACTION_CONTEXT_CAPABILITY,
    version: WORKSPACE_ACTION_CONTEXT_VERSION,
    baselineTag: EWA1_WORKSPACE_ACTION_BASELINE,
    parentPack: EWA_1_ID,
    parentVersion: WORKSPACE_ACTION_VERSION,
    records,
    recordCount: records.length,
    complianceCount: records.filter((r) => r.context === "COMPLIANCE").length,
    deliveryCount: records.filter((r) => r.context === "DELIVERY").length,
    observabilityCount: records.filter((r) => r.context === "OBSERVABILITY")
      .length,
    deferredCount: records.filter((r) => r.context === "DEFERRED").length,
    workspaceActionFingerprint: actions.fingerprint,
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

export function buildWorkspaceActionContexts(): WorkspaceActionContexts {
  const out = deriveContexts(getWorkspaceActions());
  cached = clonePack(out);
  return clonePack(cached);
}

export function getWorkspaceActionContexts(): WorkspaceActionContexts {
  if (!cached) {
    return buildWorkspaceActionContexts();
  }
  return clonePack(cached);
}

export function ensureActionsThenBuildWorkspaceActionContexts(): WorkspaceActionContexts {
  buildWorkspaceActions();
  return buildWorkspaceActionContexts();
}

export function clearWorkspaceActionContexts(): void {
  cached = null;
}
