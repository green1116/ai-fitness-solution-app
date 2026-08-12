/**
 * EAC v1 Freeze — Action Consumption EAC-1 version metadata.
 * Product: enterprise-saas-action-consumption-v1.
 * Freeze only — no new WP / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_ACTION_DELIVERY_V1,
  getEadsFreeze,
} from "../action-delivery/eads-freeze-manifest";
import {
  ACTION_CONSUMPTION_VERSION,
  EAC_1_ID,
  getActionConsumptionItems,
} from "./action-consumption";

export const EAC_FREEZE_ID = "EAC-Freeze" as const;
export const EAC_FREEZE_VERSION = "eac-freeze-1.0.0" as const;
export const EAC_FREEZE_DATE = "2026-08-12" as const;
export const ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1 =
  "enterprise-saas-action-consumption-v1" as const;

export const EAC_COMPONENTS = [
  {
    id: EAC_1_ID,
    version: ACTION_CONSUMPTION_VERSION,
    modulePath: "lib/commercial/action-consumption/action-consumption.ts",
    verifyScript: "scripts/verify-eac-1-action-consumption.ts",
    status: "frozen" as const,
  },
] as const;

export type EacFreeze = Readonly<{
  id: typeof EAC_FREEZE_ID;
  version: typeof EAC_FREEZE_VERSION;
  freezeDate: typeof EAC_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_ACTION_DELIVERY_V1;
  product: typeof ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1;
  components: typeof EAC_COMPONENTS;
  componentFingerprints: {
    "EAC-1": string;
  };
  eadsFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "EAC-1";
    chain: "DELIVERY -> CONSUMPTION -> FROZEN";
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

let cached: EacFreeze | null = null;

function cloneFreeze(row: EacFreeze): EacFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EacFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    eadsFreezeFingerprint: row.eadsFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EacFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): EacFreeze {
  const eads = getEadsFreeze();
  const consumption = getActionConsumptionItems();
  const withoutFp: Omit<EacFreeze, "fingerprint"> = {
    id: EAC_FREEZE_ID,
    version: EAC_FREEZE_VERSION,
    freezeDate: EAC_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_ACTION_DELIVERY_V1,
    product: ENTERPRISE_SAAS_ACTION_CONSUMPTION_V1,
    components: EAC_COMPONENTS,
    componentFingerprints: {
      "EAC-1": consumption.fingerprint,
    },
    eadsFreezeFingerprint: eads.fingerprint,
    certification: "certified",
    scope: {
      components: "EAC-1",
      chain: "DELIVERY -> CONSUMPTION -> FROZEN",
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

export function buildEacFreeze(): EacFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEacFreeze(): EacFreeze {
  if (!cached) {
    return buildEacFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEacFreeze(): void {
  cached = null;
}
