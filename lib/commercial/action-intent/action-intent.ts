/**
 * EWI-1 — Workspace Action Intent
 * Deterministic read-only ActionIntent from frozen EWAS surface items.
 * Baseline: enterprise-saas-workspace-action-ui-v1.
 * Intent signal only — no execution / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getWorkspaceActionSurface,
  type WorkspaceActionSurface,
  type WorkspaceActionSurfaceItem,
  EWAS_1_ID,
  WORKSPACE_ACTION_SURFACE_VERSION,
} from "../../workflow/experience/workspace-action-surface";
import { getEwasFreeze } from "../../workflow/experience/ewas-freeze-manifest";
import { getEacFreeze } from "../action-consumption/eac-freeze-manifest";
import { getEadsFreeze } from "../action-delivery/eads-freeze-manifest";
import { getEwaFreeze } from "../workspace-action/ewa-freeze-manifest";
import type { ActionConsumptionState } from "../action-consumption/action-consumption";
import type { WorkspaceActionOutcomeKind } from "../workspace-action";

export const EWI_1_ID = "EWI-1" as const;
export const ACTION_INTENT_CAPABILITY = "ActionIntent" as const;
export const ACTION_INTENT_VERSION = "ewi-1-action-intent-1" as const;
export const ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1 =
  "enterprise-saas-workspace-action-ui-v1" as const;

export const ACTION_INTENTS = [
  "REVIEW",
  "FOLLOW_UP",
  "MONITOR",
  "HOLD",
] as const;
export type ActionIntentKind = (typeof ACTION_INTENTS)[number];

const INTENT_RANK: Readonly<Record<ActionIntentKind, number>> = {
  REVIEW: 0,
  FOLLOW_UP: 1,
  MONITOR: 2,
  HOLD: 3,
};

export type ActionIntent = Readonly<{
  id: string;
  surfaceItemId: string;
  consumptionId: string;
  deliveryId: string;
  outcomeId: string;
  actionId: string;
  customerId: string;
  outcome: WorkspaceActionOutcomeKind;
  consumptionState: ActionConsumptionState;
  intent: ActionIntentKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ActionIntents = Readonly<{
  workPackageId: typeof EWI_1_ID;
  capability: typeof ACTION_INTENT_CAPABILITY;
  version: typeof ACTION_INTENT_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1;
  parentPack: typeof EWAS_1_ID;
  parentVersion: typeof WORKSPACE_ACTION_SURFACE_VERSION;
  records: readonly ActionIntent[];
  recordCount: number;
  reviewCount: number;
  followUpCount: number;
  monitorCount: number;
  holdCount: number;
  ewaFreezeFingerprint: string;
  eadsFreezeFingerprint: string;
  eacFreezeFingerprint: string;
  ewasFreezeFingerprint: string;
  workspaceActionSurfaceFingerprint: string;
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

export type BuildActionIntentInput = Readonly<{
  surface?: WorkspaceActionSurface;
}>;

let cached: ActionIntents | null = null;

function clonePack(row: ActionIntents): ActionIntents {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function intentFromSurfaceItem(
  item: WorkspaceActionSurfaceItem,
): { intent: ActionIntentKind; reason: string } {
  if (item.state === "ATTENTION" || item.outcome === "ESCALATE") {
    return {
      intent: "REVIEW",
      reason: "intent-review-from-attention",
    };
  }
  if (item.state === "AVAILABLE" && item.outcome === "WATCH") {
    return {
      intent: "MONITOR",
      reason: "intent-monitor-from-watch",
    };
  }
  if (item.state === "AVAILABLE" || item.outcome === "READY") {
    return {
      intent: "FOLLOW_UP",
      reason: "intent-follow-up-from-available",
    };
  }
  return {
    intent: "HOLD",
    reason: "intent-hold-from-deferred",
  };
}

function recordFingerprint(row: Omit<ActionIntent, "fingerprint">): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        surfaceItemId: row.surfaceItemId,
        consumptionId: row.consumptionId,
        deliveryId: row.deliveryId,
        outcomeId: row.outcomeId,
        actionId: row.actionId,
        customerId: row.customerId,
        outcome: row.outcome,
        consumptionState: row.consumptionState,
        intent: row.intent,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePayload(row: Omit<ActionIntents, "fingerprint">): string {
  return JSON.stringify({
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    records: row.records,
    recordCount: row.recordCount,
    reviewCount: row.reviewCount,
    followUpCount: row.followUpCount,
    monitorCount: row.monitorCount,
    holdCount: row.holdCount,
    ewaFreezeFingerprint: row.ewaFreezeFingerprint,
    eadsFreezeFingerprint: row.eadsFreezeFingerprint,
    eacFreezeFingerprint: row.eacFreezeFingerprint,
    ewasFreezeFingerprint: row.ewasFreezeFingerprint,
    workspaceActionSurfaceFingerprint: row.workspaceActionSurfaceFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<ActionIntents, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectRecord(
  item: WorkspaceActionSurfaceItem,
): Omit<ActionIntent, "fingerprint" | "ordinal"> {
  const mapped = intentFromSurfaceItem(item);
  return {
    id: item.id.replace(/^eac-1:/, "ewi-1:"),
    surfaceItemId: item.id,
    consumptionId: item.id,
    deliveryId: item.deliveryId,
    outcomeId: item.outcomeId,
    actionId: item.actionId,
    customerId: item.customerId,
    outcome: item.outcome,
    consumptionState: item.state,
    intent: mapped.intent,
    reason: mapped.reason,
  };
}

function deriveIntents(surface: WorkspaceActionSurface): ActionIntents {
  const ewa = getEwaFreeze();
  const eads = getEadsFreeze();
  const eac = getEacFreeze();
  const ewas = getEwasFreeze();
  const projected = surface.items.map(projectRecord);
  const sorted = [...projected].sort((a, b) => {
    const byIntent = INTENT_RANK[a.intent] - INTENT_RANK[b.intent];
    if (byIntent !== 0) return byIntent;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records: ActionIntent[] = sorted.map((row, ordinal) => {
    const withoutFp = { ...row, ordinal };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const withoutFp: Omit<ActionIntents, "fingerprint"> = {
    workPackageId: EWI_1_ID,
    capability: ACTION_INTENT_CAPABILITY,
    version: ACTION_INTENT_VERSION,
    baselineTag: ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1,
    parentPack: EWAS_1_ID,
    parentVersion: WORKSPACE_ACTION_SURFACE_VERSION,
    records,
    recordCount: records.length,
    reviewCount: records.filter((r) => r.intent === "REVIEW").length,
    followUpCount: records.filter((r) => r.intent === "FOLLOW_UP").length,
    monitorCount: records.filter((r) => r.intent === "MONITOR").length,
    holdCount: records.filter((r) => r.intent === "HOLD").length,
    ewaFreezeFingerprint: ewa.fingerprint,
    eadsFreezeFingerprint: eads.fingerprint,
    eacFreezeFingerprint: eac.fingerprint,
    ewasFreezeFingerprint: ewas.fingerprint,
    workspaceActionSurfaceFingerprint: surface.fingerprint,
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

export function buildActionIntents(
  input?: BuildActionIntentInput,
): ActionIntents {
  const out = deriveIntents(input?.surface ?? getWorkspaceActionSurface());
  cached = clonePack(out);
  return clonePack(cached);
}

export function getActionIntents(): ActionIntents {
  if (!cached) {
    return buildActionIntents();
  }
  return clonePack(cached);
}

export function clearActionIntents(): void {
  cached = null;
}
