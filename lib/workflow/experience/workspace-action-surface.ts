/**
 * EWAS-1 — Workspace Action Surface
 * Exposes frozen EAC-1 ActionConsumptionItems on Workspace surface contract.
 * No duplicate action model / persistence / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getActionConsumptionItems,
  type ActionConsumptionItem,
  type ActionConsumptionItems,
} from "../../commercial/action-consumption/action-consumption";
import {
  ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1,
  getEacFreeze,
} from "../../commercial/action-consumption/eac-freeze-manifest";

export const EWAS_1_ID = "EWAS-1" as const;
export const WORKSPACE_ACTION_SURFACE_CAPABILITY =
  "WorkspaceActionSurface" as const;
export const WORKSPACE_ACTION_SURFACE_VERSION =
  "ewas-1-workspace-action-surface-1" as const;

/** Reuses EAC-1 item contract — no duplicate action model. */
export type WorkspaceActionSurfaceItem = ActionConsumptionItem;

export type WorkspaceActionSurface = Readonly<{
  workPackageId: typeof EWAS_1_ID;
  capability: typeof WORKSPACE_ACTION_SURFACE_CAPABILITY;
  version: typeof WORKSPACE_ACTION_SURFACE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1;
  items: readonly WorkspaceActionSurfaceItem[];
  recordCount: number;
  availableCount: number;
  attentionCount: number;
  deferredCount: number;
  actionConsumptionFingerprint: string;
  eacFreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    viewOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noPrisma: true;
    noFrozenLayerChanges: true;
    noDuplicateActionModel: true;
  };
}>;

export type BuildWorkspaceActionSurfaceInput = Readonly<{
  consumption?: ActionConsumptionItems;
}>;

let cached: WorkspaceActionSurface | null = null;

function cloneSurface(row: WorkspaceActionSurface): WorkspaceActionSurface {
  return {
    ...row,
    items: row.items.map((item) => ({ ...item })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<WorkspaceActionSurface, "fingerprint">): string {
  return JSON.stringify({
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    items: row.items,
    recordCount: row.recordCount,
    availableCount: row.availableCount,
    attentionCount: row.attentionCount,
    deferredCount: row.deferredCount,
    actionConsumptionFingerprint: row.actionConsumptionFingerprint,
    eacFreezeFingerprint: row.eacFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<WorkspaceActionSurface, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveSurface(consumption: ActionConsumptionItems): WorkspaceActionSurface {
  const eac = getEacFreeze();
  const withoutFp: Omit<WorkspaceActionSurface, "fingerprint"> = {
    workPackageId: EWAS_1_ID,
    capability: WORKSPACE_ACTION_SURFACE_CAPABILITY,
    version: WORKSPACE_ACTION_SURFACE_VERSION,
    baselineTag: ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1,
    items: consumption.records,
    recordCount: consumption.recordCount,
    availableCount: consumption.availableCount,
    attentionCount: consumption.attentionCount,
    deferredCount: consumption.deferredCount,
    actionConsumptionFingerprint: consumption.fingerprint,
    eacFreezeFingerprint: eac.fingerprint,
    scope: {
      readOnly: true,
      viewOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noPrisma: true,
      noFrozenLayerChanges: true,
      noDuplicateActionModel: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildWorkspaceActionSurface(
  input?: BuildWorkspaceActionSurfaceInput,
): WorkspaceActionSurface {
  const out = deriveSurface(input?.consumption ?? getActionConsumptionItems());
  cached = cloneSurface(out);
  return cloneSurface(cached);
}

export function getWorkspaceActionSurface(): WorkspaceActionSurface {
  if (!cached) {
    return buildWorkspaceActionSurface();
  }
  return cloneSurface(cached);
}

export function readWorkspaceActionSurface(): WorkspaceActionSurface {
  return getWorkspaceActionSurface();
}

export function clearWorkspaceActionSurface(): void {
  cached = null;
}
