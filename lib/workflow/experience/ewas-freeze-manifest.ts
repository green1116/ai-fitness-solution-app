/**
 * EWAS v1 Freeze — Workspace Action Surface EWAS-1 version metadata.
 * Product: enterprise-saas-workspace-action-surface-v1.
 * Freeze only — no new WP / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1,
  getEacFreeze,
} from "../../commercial/action-consumption/eac-freeze-manifest";
import {
  EWAS_1_ID,
  WORKSPACE_ACTION_SURFACE_VERSION,
  getWorkspaceActionSurface,
} from "./workspace-action-surface";

export const EWAS_FREEZE_ID = "EWAS-Freeze" as const;
export const EWAS_FREEZE_VERSION = "ewas-freeze-1.0.0" as const;
export const EWAS_FREEZE_DATE = "2026-08-12" as const;
export const ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1 =
  "enterprise-saas-workspace-action-surface-v1" as const;

export const EWAS_COMPONENTS = [
  {
    id: EWAS_1_ID,
    version: WORKSPACE_ACTION_SURFACE_VERSION,
    modulePath: "lib/workflow/experience/workspace-action-surface.ts",
    verifyScript: "scripts/verify-ewas-1-workspace-action-surface.ts",
    status: "frozen" as const,
  },
] as const;

export type EwasFreeze = Readonly<{
  id: typeof EWAS_FREEZE_ID;
  version: typeof EWAS_FREEZE_VERSION;
  freezeDate: typeof EWAS_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1;
  product: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1;
  components: typeof EWAS_COMPONENTS;
  componentFingerprints: {
    "EWAS-1": string;
  };
  eacFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "EWAS-1";
    chain: "CONSUMPTION -> SURFACE -> FROZEN";
    freezeOnly: true;
    readOnly: true;
    noPersistence: true;
    noPrisma: true;
    noRuntimeSideEffects: true;
    noExecution: true;
    noFrozenLayerChanges: true;
    preserveWorkspaceUi: true;
  };
  fingerprint: string;
}>;

let cached: EwasFreeze | null = null;

function cloneFreeze(row: EwasFreeze): EwasFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EwasFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    eacFreezeFingerprint: row.eacFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EwasFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): EwasFreeze {
  const eac = getEacFreeze();
  const surface = getWorkspaceActionSurface();
  const withoutFp: Omit<EwasFreeze, "fingerprint"> = {
    id: EWAS_FREEZE_ID,
    version: EWAS_FREEZE_VERSION,
    freezeDate: EWAS_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1,
    product: ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1,
    components: EWAS_COMPONENTS,
    componentFingerprints: {
      "EWAS-1": surface.fingerprint,
    },
    eacFreezeFingerprint: eac.fingerprint,
    certification: "certified",
    scope: {
      components: "EWAS-1",
      chain: "CONSUMPTION -> SURFACE -> FROZEN",
      freezeOnly: true,
      readOnly: true,
      noPersistence: true,
      noPrisma: true,
      noRuntimeSideEffects: true,
      noExecution: true,
      noFrozenLayerChanges: true,
      preserveWorkspaceUi: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildEwasFreeze(): EwasFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEwasFreeze(): EwasFreeze {
  if (!cached) {
    return buildEwasFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEwasFreeze(): void {
  cached = null;
}
