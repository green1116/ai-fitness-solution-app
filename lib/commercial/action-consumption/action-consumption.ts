/**
 * EAC-1 — Action Consumption Projection
 * Deterministic read-only ActionConsumptionItem from frozen EADS delivery.
 * Baseline: enterprise-saas-action-delivery-v1.
 * No persistence / Prisma / mutation / frozen-layer changes.
 */

import { createHash } from "node:crypto";

import { getOperationsSurface } from "../operations-surface";
import { getProductIntelligenceView } from "../../product/intelligence";
import { getPexFreeze } from "../../product/experience";
import { getWfxFreeze } from "../../workflow/experience";
import {
  ACTION_DELIVERY_VERSION,
  EADS_1_ID,
  getActionDeliveryItems,
  type ActionDeliveryItem,
  type ActionDeliveryItems,
  type ActionDeliveryState,
} from "../action-delivery";
import {
  ENTERPRISE_SAAS_ACTION_DELIVERY_V1,
  getEadsFreeze,
} from "../action-delivery/eads-freeze-manifest";
import { getEwaFreeze } from "../workspace-action/ewa-freeze-manifest";
import type { WorkspaceActionOutcomeKind } from "../workspace-action";

export const EAC_1_ID = "EAC-1" as const;
export const ACTION_CONSUMPTION_CAPABILITY = "ActionConsumption" as const;
export const ACTION_CONSUMPTION_VERSION = "eac-1-action-consumption-1" as const;

export const ACTION_CONSUMPTION_STATES = [
  "AVAILABLE",
  "ATTENTION",
  "DEFERRED",
] as const;
export type ActionConsumptionState = (typeof ACTION_CONSUMPTION_STATES)[number];

const CONSUMPTION_STATE_RANK: Readonly<Record<ActionConsumptionState, number>> = {
  ATTENTION: 0,
  AVAILABLE: 1,
  DEFERRED: 2,
};

export type ActionConsumptionItem = Readonly<{
  id: string;
  deliveryId: string;
  outcomeId: string;
  actionId: string;
  customerId: string;
  outcome: WorkspaceActionOutcomeKind;
  deliveryState: ActionDeliveryState;
  state: ActionConsumptionState;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ActionConsumptionItems = Readonly<{
  workPackageId: typeof EAC_1_ID;
  capability: typeof ACTION_CONSUMPTION_CAPABILITY;
  version: typeof ACTION_CONSUMPTION_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_ACTION_DELIVERY_V1;
  parentPack: typeof EADS_1_ID;
  parentVersion: typeof ACTION_DELIVERY_VERSION;
  records: readonly ActionConsumptionItem[];
  recordCount: number;
  availableCount: number;
  attentionCount: number;
  deferredCount: number;
  operationsSurfaceFingerprint: string;
  productIntelligenceFingerprint: string;
  pexFreezeFingerprint: string;
  wfxFreezeFingerprint: string;
  ewaFreezeFingerprint: string;
  eadsFreezeFingerprint: string;
  actionDeliveryFingerprint: string;
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

export type BuildActionConsumptionInput = Readonly<{
  delivery?: ActionDeliveryItems;
}>;

let cached: ActionConsumptionItems | null = null;

function clonePack(row: ActionConsumptionItems): ActionConsumptionItems {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function consumptionStateFromDelivery(
  deliveryState: ActionDeliveryState,
): { state: ActionConsumptionState; reason: string } {
  if (deliveryState === "ATTENTION") {
    return {
      state: "ATTENTION",
      reason: "consumption-attention-from-attention",
    };
  }
  if (deliveryState === "VISIBLE") {
    return {
      state: "AVAILABLE",
      reason: "consumption-available-from-visible",
    };
  }
  return {
    state: "DEFERRED",
    reason: "consumption-deferred-from-deferred",
  };
}

function recordFingerprint(
  row: Omit<ActionConsumptionItem, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        deliveryId: row.deliveryId,
        outcomeId: row.outcomeId,
        actionId: row.actionId,
        customerId: row.customerId,
        outcome: row.outcome,
        deliveryState: row.deliveryState,
        state: row.state,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePayload(row: Omit<ActionConsumptionItems, "fingerprint">): string {
  return JSON.stringify({
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    records: row.records,
    recordCount: row.recordCount,
    availableCount: row.availableCount,
    attentionCount: row.attentionCount,
    deferredCount: row.deferredCount,
    operationsSurfaceFingerprint: row.operationsSurfaceFingerprint,
    productIntelligenceFingerprint: row.productIntelligenceFingerprint,
    pexFreezeFingerprint: row.pexFreezeFingerprint,
    wfxFreezeFingerprint: row.wfxFreezeFingerprint,
    ewaFreezeFingerprint: row.ewaFreezeFingerprint,
    eadsFreezeFingerprint: row.eadsFreezeFingerprint,
    actionDeliveryFingerprint: row.actionDeliveryFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ActionConsumptionItems, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectRecord(
  row: ActionDeliveryItem,
): Omit<ActionConsumptionItem, "fingerprint" | "ordinal"> {
  const mapped = consumptionStateFromDelivery(row.deliveryState);
  return {
    id: row.id.replace(/^eads-1:/, "eac-1:"),
    deliveryId: row.id,
    outcomeId: row.outcomeId,
    actionId: row.actionId,
    customerId: row.customerId,
    outcome: row.outcome,
    deliveryState: row.deliveryState,
    state: mapped.state,
    reason: mapped.reason,
  };
}

function deriveItems(delivery: ActionDeliveryItems): ActionConsumptionItems {
  const surface = getOperationsSurface();
  const view = getProductIntelligenceView();
  const pex = getPexFreeze();
  const wfx = getWfxFreeze();
  const ewa = getEwaFreeze();
  const eads = getEadsFreeze();
  const projected = delivery.records.map(projectRecord);
  const sorted = [...projected].sort((a, b) => {
    const byState = CONSUMPTION_STATE_RANK[a.state] - CONSUMPTION_STATE_RANK[b.state];
    if (byState !== 0) return byState;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records: ActionConsumptionItem[] = sorted.map((row, ordinal) => {
    const withoutFp = { ...row, ordinal };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const withoutFp: Omit<ActionConsumptionItems, "fingerprint"> = {
    workPackageId: EAC_1_ID,
    capability: ACTION_CONSUMPTION_CAPABILITY,
    version: ACTION_CONSUMPTION_VERSION,
    baselineTag: ENTERPRISE_SAAS_ACTION_DELIVERY_V1,
    parentPack: EADS_1_ID,
    parentVersion: ACTION_DELIVERY_VERSION,
    records,
    recordCount: records.length,
    availableCount: records.filter((r) => r.state === "AVAILABLE").length,
    attentionCount: records.filter((r) => r.state === "ATTENTION").length,
    deferredCount: records.filter((r) => r.state === "DEFERRED").length,
    operationsSurfaceFingerprint: surface.fingerprint,
    productIntelligenceFingerprint: view.fingerprint,
    pexFreezeFingerprint: pex.fingerprint,
    wfxFreezeFingerprint: wfx.fingerprint,
    ewaFreezeFingerprint: ewa.fingerprint,
    eadsFreezeFingerprint: eads.fingerprint,
    actionDeliveryFingerprint: delivery.fingerprint,
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

export function buildActionConsumptionItems(
  input?: BuildActionConsumptionInput,
): ActionConsumptionItems {
  const out = deriveItems(input?.delivery ?? getActionDeliveryItems());
  cached = clonePack(out);
  return clonePack(cached);
}

export function getActionConsumptionItems(): ActionConsumptionItems {
  if (!cached) {
    return buildActionConsumptionItems();
  }
  return clonePack(cached);
}

export function clearActionConsumptionItems(): void {
  cached = null;
}
