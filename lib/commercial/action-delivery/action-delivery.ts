/**
 * EADS-1 — Action Delivery Projection
 * Deterministic read-only ActionDeliveryItem from frozen EWA outcomes.
 * Baseline: enterprise-saas-workspace-action-v1.
 * No persistence / Prisma / mutation / frozen-layer changes.
 */

import { createHash } from "node:crypto";

import { getOperationsSurface } from "../operations-surface";
import { getProductIntelligenceView } from "../../product/intelligence";
import { getPexFreeze } from "../../product/experience";
import { getWfxFreeze } from "../../workflow/experience";
import {
  EWA_3_ID,
  WORKSPACE_ACTION_OUTCOME_VERSION,
  getWorkspaceActionOutcomes,
  type WorkspaceActionOutcomeKind,
  type WorkspaceActionOutcomes,
} from "../workspace-action";
import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_V1,
  getEwaFreeze,
} from "../workspace-action/ewa-freeze-manifest";

export const EADS_1_ID = "EADS-1" as const;
export const ACTION_DELIVERY_CAPABILITY = "ActionDelivery" as const;
export const ACTION_DELIVERY_VERSION = "eads-1-action-delivery-1" as const;

export const ACTION_DELIVERY_STATES = [
  "VISIBLE",
  "ATTENTION",
  "DEFERRED",
] as const;
export type ActionDeliveryState = (typeof ACTION_DELIVERY_STATES)[number];

const DELIVERY_STATE_RANK: Readonly<Record<ActionDeliveryState, number>> = {
  ATTENTION: 0,
  VISIBLE: 1,
  DEFERRED: 2,
};

export type ActionDeliveryItem = Readonly<{
  id: string;
  outcomeId: string;
  actionId: string;
  customerId: string;
  outcome: WorkspaceActionOutcomeKind;
  deliveryState: ActionDeliveryState;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ActionDeliveryItems = Readonly<{
  workPackageId: typeof EADS_1_ID;
  capability: typeof ACTION_DELIVERY_CAPABILITY;
  version: typeof ACTION_DELIVERY_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_V1;
  parentPack: typeof EWA_3_ID;
  parentVersion: typeof WORKSPACE_ACTION_OUTCOME_VERSION;
  records: readonly ActionDeliveryItem[];
  recordCount: number;
  visibleCount: number;
  attentionCount: number;
  deferredCount: number;
  operationsSurfaceFingerprint: string;
  productIntelligenceFingerprint: string;
  pexFreezeFingerprint: string;
  wfxFreezeFingerprint: string;
  ewaFreezeFingerprint: string;
  workspaceActionOutcomeFingerprint: string;
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

export type BuildActionDeliveryInput = Readonly<{
  outcomes?: WorkspaceActionOutcomes;
}>;

let cached: ActionDeliveryItems | null = null;

function clonePack(row: ActionDeliveryItems): ActionDeliveryItems {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function deliveryStateFromOutcome(
  outcome: WorkspaceActionOutcomeKind,
): { deliveryState: ActionDeliveryState; reason: string } {
  if (outcome === "ESCALATE") {
    return {
      deliveryState: "ATTENTION",
      reason: "delivery-attention-from-escalate",
    };
  }
  if (outcome === "READY" || outcome === "WATCH") {
    return {
      deliveryState: "VISIBLE",
      reason: `delivery-visible-from-${outcome.toLowerCase()}`,
    };
  }
  return {
    deliveryState: "DEFERRED",
    reason: "delivery-deferred-from-hold",
  };
}

function recordFingerprint(
  row: Omit<ActionDeliveryItem, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        outcomeId: row.outcomeId,
        actionId: row.actionId,
        customerId: row.customerId,
        outcome: row.outcome,
        deliveryState: row.deliveryState,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePayload(row: Omit<ActionDeliveryItems, "fingerprint">): string {
  return JSON.stringify({
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    records: row.records,
    recordCount: row.recordCount,
    visibleCount: row.visibleCount,
    attentionCount: row.attentionCount,
    deferredCount: row.deferredCount,
    operationsSurfaceFingerprint: row.operationsSurfaceFingerprint,
    productIntelligenceFingerprint: row.productIntelligenceFingerprint,
    pexFreezeFingerprint: row.pexFreezeFingerprint,
    wfxFreezeFingerprint: row.wfxFreezeFingerprint,
    ewaFreezeFingerprint: row.ewaFreezeFingerprint,
    workspaceActionOutcomeFingerprint: row.workspaceActionOutcomeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<ActionDeliveryItems, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveItems(outcomes: WorkspaceActionOutcomes): ActionDeliveryItems {
  const surface = getOperationsSurface();
  const view = getProductIntelligenceView();
  const pex = getPexFreeze();
  const wfx = getWfxFreeze();
  const ewa = getEwaFreeze();
  const projected = outcomes.records.map((row) => {
    const mapped = deliveryStateFromOutcome(row.outcome);
    return {
      id: row.id.replace(/^ewa-3:/, "eads-1:"),
      outcomeId: row.id,
      actionId: row.actionId,
      customerId: row.customerId,
      outcome: row.outcome,
      deliveryState: mapped.deliveryState,
      reason: mapped.reason,
    };
  });
  const sorted = [...projected].sort((a, b) => {
    const byState =
      DELIVERY_STATE_RANK[a.deliveryState] - DELIVERY_STATE_RANK[b.deliveryState];
    if (byState !== 0) return byState;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records: ActionDeliveryItem[] = sorted.map((row, ordinal) => {
    const withoutFp = { ...row, ordinal };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const withoutFp: Omit<ActionDeliveryItems, "fingerprint"> = {
    workPackageId: EADS_1_ID,
    capability: ACTION_DELIVERY_CAPABILITY,
    version: ACTION_DELIVERY_VERSION,
    baselineTag: ENTERPRISE_SAAS_WORKSPACE_ACTION_V1,
    parentPack: EWA_3_ID,
    parentVersion: WORKSPACE_ACTION_OUTCOME_VERSION,
    records,
    recordCount: records.length,
    visibleCount: records.filter((r) => r.deliveryState === "VISIBLE").length,
    attentionCount: records.filter((r) => r.deliveryState === "ATTENTION").length,
    deferredCount: records.filter((r) => r.deliveryState === "DEFERRED").length,
    operationsSurfaceFingerprint: surface.fingerprint,
    productIntelligenceFingerprint: view.fingerprint,
    pexFreezeFingerprint: pex.fingerprint,
    wfxFreezeFingerprint: wfx.fingerprint,
    ewaFreezeFingerprint: ewa.fingerprint,
    workspaceActionOutcomeFingerprint: outcomes.fingerprint,
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

export function buildActionDeliveryItems(
  input?: BuildActionDeliveryInput,
): ActionDeliveryItems {
  const out = deriveItems(input?.outcomes ?? getWorkspaceActionOutcomes());
  cached = clonePack(out);
  return clonePack(cached);
}

export function getActionDeliveryItems(): ActionDeliveryItems {
  if (!cached) {
    return buildActionDeliveryItems();
  }
  return clonePack(cached);
}

export function clearActionDeliveryItems(): void {
  cached = null;
}
