/**
 * EWA-3 — Action Outcome Signal
 * Deterministic WorkspaceActionOutcome from EWA-1 action + EWA-2 context.
 * Baseline: ewa-2-action-context-1.
 * Read-only — no persistence / Prisma / execution / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  EWA_2_ID,
  WORKSPACE_ACTION_CONTEXT_VERSION,
  buildWorkspaceActionContexts,
  getWorkspaceActionContexts,
  type WorkspaceActionContext,
  type WorkspaceActionContexts,
  type WorkspaceBusinessContext,
  type WorkspaceContextPriority,
} from "./action-context";
import type {
  WorkspaceActionStatus,
  WorkspaceActionType,
} from "./workspace-action";
import { getWorkspaceActions } from "./workspace-action";

export const EWA_3_ID = "EWA-3" as const;
export const WORKSPACE_ACTION_OUTCOME_CAPABILITY =
  "WorkspaceActionOutcome" as const;
export const WORKSPACE_ACTION_OUTCOME_VERSION =
  "ewa-3-action-outcome-1" as const;
export const EWA2_ACTION_CONTEXT_BASELINE = "ewa2-action-context-v1" as const;

export const WORKSPACE_ACTION_OUTCOMES = [
  "READY",
  "WATCH",
  "HOLD",
  "ESCALATE",
] as const;
export type WorkspaceActionOutcomeKind =
  (typeof WORKSPACE_ACTION_OUTCOMES)[number];

const OUTCOME_RANK: Readonly<Record<WorkspaceActionOutcomeKind, number>> = {
  ESCALATE: 0,
  READY: 1,
  WATCH: 2,
  HOLD: 3,
};

export type WorkspaceActionOutcome = Readonly<{
  id: string;
  contextId: string;
  actionId: string;
  customerId: string;
  actionType: WorkspaceActionType;
  status: WorkspaceActionStatus;
  context: WorkspaceBusinessContext;
  priority: WorkspaceContextPriority;
  outcome: WorkspaceActionOutcomeKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type WorkspaceActionOutcomes = Readonly<{
  workPackageId: typeof EWA_3_ID;
  capability: typeof WORKSPACE_ACTION_OUTCOME_CAPABILITY;
  version: typeof WORKSPACE_ACTION_OUTCOME_VERSION;
  baselineTag: typeof EWA2_ACTION_CONTEXT_BASELINE;
  parentPack: typeof EWA_2_ID;
  parentVersion: typeof WORKSPACE_ACTION_CONTEXT_VERSION;
  records: readonly WorkspaceActionOutcome[];
  recordCount: number;
  readyCount: number;
  watchCount: number;
  holdCount: number;
  escalateCount: number;
  workspaceActionFingerprint: string;
  actionContextFingerprint: string;
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

let cached: WorkspaceActionOutcomes | null = null;

function clonePack(row: WorkspaceActionOutcomes): WorkspaceActionOutcomes {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function outcomeFromContext(
  ctx: WorkspaceActionContext,
): { outcome: WorkspaceActionOutcomeKind; reason: string } {
  if (
    ctx.priority === "P1" ||
    ctx.status === "OPEN" ||
    ctx.actionType === "REVIEW" ||
    ctx.context === "COMPLIANCE"
  ) {
    return { outcome: "ESCALATE", reason: "outcome-escalate-from-compliance" };
  }
  if (
    ctx.priority === "P2" ||
    ctx.status === "QUEUED" ||
    ctx.actionType === "PREPARE" ||
    ctx.context === "DELIVERY"
  ) {
    return { outcome: "READY", reason: "outcome-ready-from-delivery" };
  }
  if (
    ctx.priority === "P3" ||
    ctx.status === "WATCH" ||
    ctx.actionType === "MONITOR" ||
    ctx.context === "OBSERVABILITY"
  ) {
    return { outcome: "WATCH", reason: "outcome-watch-from-observability" };
  }
  return { outcome: "HOLD", reason: "outcome-hold-from-deferred" };
}

function recordFingerprint(
  row: Omit<WorkspaceActionOutcome, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        contextId: row.contextId,
        actionId: row.actionId,
        customerId: row.customerId,
        actionType: row.actionType,
        status: row.status,
        context: row.context,
        priority: row.priority,
        outcome: row.outcome,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePayload(
  row: Omit<WorkspaceActionOutcomes, "fingerprint">,
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
    readyCount: row.readyCount,
    watchCount: row.watchCount,
    holdCount: row.holdCount,
    escalateCount: row.escalateCount,
    workspaceActionFingerprint: row.workspaceActionFingerprint,
    actionContextFingerprint: row.actionContextFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<WorkspaceActionOutcomes, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectRecord(
  ctx: WorkspaceActionContext,
): Omit<WorkspaceActionOutcome, "fingerprint" | "ordinal"> {
  const mapped = outcomeFromContext(ctx);
  return {
    id: ctx.id.replace(/^ewa-2:/, "ewa-3:"),
    contextId: ctx.id,
    actionId: ctx.actionId,
    customerId: ctx.customerId,
    actionType: ctx.actionType,
    status: ctx.status,
    context: ctx.context,
    priority: ctx.priority,
    outcome: mapped.outcome,
    reason: mapped.reason,
  };
}

function deriveOutcomes(
  contexts: WorkspaceActionContexts,
): WorkspaceActionOutcomes {
  const actions = getWorkspaceActions();
  const projected = contexts.records.map(projectRecord);
  const sorted = [...projected].sort((a, b) => {
    const byOutcome = OUTCOME_RANK[a.outcome] - OUTCOME_RANK[b.outcome];
    if (byOutcome !== 0) return byOutcome;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records: WorkspaceActionOutcome[] = sorted.map((row, ordinal) => {
    const withoutFp = { ...row, ordinal };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const withoutFp: Omit<WorkspaceActionOutcomes, "fingerprint"> = {
    workPackageId: EWA_3_ID,
    capability: WORKSPACE_ACTION_OUTCOME_CAPABILITY,
    version: WORKSPACE_ACTION_OUTCOME_VERSION,
    baselineTag: EWA2_ACTION_CONTEXT_BASELINE,
    parentPack: EWA_2_ID,
    parentVersion: WORKSPACE_ACTION_CONTEXT_VERSION,
    records,
    recordCount: records.length,
    readyCount: records.filter((r) => r.outcome === "READY").length,
    watchCount: records.filter((r) => r.outcome === "WATCH").length,
    holdCount: records.filter((r) => r.outcome === "HOLD").length,
    escalateCount: records.filter((r) => r.outcome === "ESCALATE").length,
    workspaceActionFingerprint: actions.fingerprint,
    actionContextFingerprint: contexts.fingerprint,
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

export function buildWorkspaceActionOutcomes(): WorkspaceActionOutcomes {
  const out = deriveOutcomes(getWorkspaceActionContexts());
  cached = clonePack(out);
  return clonePack(cached);
}

export function getWorkspaceActionOutcomes(): WorkspaceActionOutcomes {
  if (!cached) {
    return buildWorkspaceActionOutcomes();
  }
  return clonePack(cached);
}

export function ensureContextsThenBuildWorkspaceActionOutcomes(): WorkspaceActionOutcomes {
  buildWorkspaceActionContexts();
  return buildWorkspaceActionOutcomes();
}

export function clearWorkspaceActionOutcomes(): void {
  cached = null;
}
