/**
 * EWI v1 Freeze — Workspace Action Intent EWI-1 version metadata.
 * Product: enterprise-saas-workspace-action-intent-v1.
 * Freeze only — no new WP / persistence / Prisma / execution / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1,
  getEwasFreeze,
} from "../../workflow/experience/ewas-freeze-manifest";
import {
  ACTION_INTENT_VERSION,
  ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1,
  EWI_1_ID,
  getActionIntents,
} from "./action-intent";

export const EWI_FREEZE_ID = "EWI-Freeze" as const;
export const EWI_FREEZE_VERSION = "ewi-freeze-1.0.0" as const;
export const EWI_FREEZE_DATE = "2026-08-12" as const;
export const ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1 =
  "enterprise-saas-workspace-action-intent-v1" as const;

export const EWI_COMPONENTS = [
  {
    id: EWI_1_ID,
    version: ACTION_INTENT_VERSION,
    modulePath: "lib/commercial/action-intent/action-intent.ts",
    verifyScript: "scripts/verify-ewi-1-action-intent.ts",
    status: "frozen" as const,
  },
] as const;

export type EwiFreeze = Readonly<{
  id: typeof EWI_FREEZE_ID;
  version: typeof EWI_FREEZE_VERSION;
  freezeDate: typeof EWI_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1;
  product: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1;
  surfaceBaseline: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1;
  components: typeof EWI_COMPONENTS;
  componentFingerprints: {
    "EWI-1": string;
  };
  ewasFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "EWI-1";
    chain: "UI -> INTENT -> FROZEN";
    freezeOnly: true;
    readOnly: true;
    noPersistence: true;
    noPrisma: true;
    noRuntimeSideEffects: true;
    noExecution: true;
    noFrozenLayerChanges: true;
  };
  fingerprint: string;
}>;

let cached: EwiFreeze | null = null;

function cloneFreeze(row: EwiFreeze): EwiFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EwiFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    surfaceBaseline: row.surfaceBaseline,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    ewasFreezeFingerprint: row.ewasFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EwiFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): EwiFreeze {
  const ewas = getEwasFreeze();
  const intents = getActionIntents();
  const withoutFp: Omit<EwiFreeze, "fingerprint"> = {
    id: EWI_FREEZE_ID,
    version: EWI_FREEZE_VERSION,
    freezeDate: EWI_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1,
    product: ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1,
    surfaceBaseline: ENTERPRISE_SAAS_WORKSPACE_ACTION_SURFACE_V1,
    components: EWI_COMPONENTS,
    componentFingerprints: {
      "EWI-1": intents.fingerprint,
    },
    ewasFreezeFingerprint: ewas.fingerprint,
    certification: "certified",
    scope: {
      components: "EWI-1",
      chain: "UI -> INTENT -> FROZEN",
      freezeOnly: true,
      readOnly: true,
      noPersistence: true,
      noPrisma: true,
      noRuntimeSideEffects: true,
      noExecution: true,
      noFrozenLayerChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildEwiFreeze(): EwiFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEwiFreeze(): EwiFreeze {
  if (!cached) {
    return buildEwiFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEwiFreeze(): void {
  cached = null;
}
