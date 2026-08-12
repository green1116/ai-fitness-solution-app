/**
 * EADS v1 Freeze — Action Delivery EADS-1 version metadata.
 * Product: enterprise-saas-action-delivery-v1.
 * Freeze only — no new WP / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_V1,
  getEwaFreeze,
} from "../workspace-action/ewa-freeze-manifest";
import {
  ACTION_DELIVERY_VERSION,
  EADS_1_ID,
  getActionDeliveryItems,
} from "./action-delivery";

export const EADS_FREEZE_ID = "EADS-Freeze" as const;
export const EADS_FREEZE_VERSION = "eads-freeze-1.0.0" as const;
export const EADS_FREEZE_DATE = "2026-08-12" as const;
export const ENTERPRISE_SAAS_ACTION_DELIVERY_V1 =
  "enterprise-saas-action-delivery-v1" as const;

export const EADS_COMPONENTS = [
  {
    id: EADS_1_ID,
    version: ACTION_DELIVERY_VERSION,
    modulePath: "lib/commercial/action-delivery/action-delivery.ts",
    verifyScript: "scripts/verify-eads-1-action-delivery.ts",
    status: "frozen" as const,
  },
] as const;

export type EadsFreeze = Readonly<{
  id: typeof EADS_FREEZE_ID;
  version: typeof EADS_FREEZE_VERSION;
  freezeDate: typeof EADS_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_V1;
  product: typeof ENTERPRISE_SAAS_ACTION_DELIVERY_V1;
  components: typeof EADS_COMPONENTS;
  componentFingerprints: {
    "EADS-1": string;
  };
  ewaFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "EADS-1";
    chain: "OUTCOME -> DELIVERY -> FROZEN";
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

let cached: EadsFreeze | null = null;

function cloneFreeze(row: EadsFreeze): EadsFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EadsFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    ewaFreezeFingerprint: row.ewaFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EadsFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): EadsFreeze {
  const ewa = getEwaFreeze();
  const delivery = getActionDeliveryItems();
  const withoutFp: Omit<EadsFreeze, "fingerprint"> = {
    id: EADS_FREEZE_ID,
    version: EADS_FREEZE_VERSION,
    freezeDate: EADS_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_WORKSPACE_ACTION_V1,
    product: ENTERPRISE_SAAS_ACTION_DELIVERY_V1,
    components: EADS_COMPONENTS,
    componentFingerprints: {
      "EADS-1": delivery.fingerprint,
    },
    ewaFreezeFingerprint: ewa.fingerprint,
    certification: "certified",
    scope: {
      components: "EADS-1",
      chain: "OUTCOME -> DELIVERY -> FROZEN",
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

export function buildEadsFreeze(): EadsFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEadsFreeze(): EadsFreeze {
  if (!cached) {
    return buildEadsFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEadsFreeze(): void {
  cached = null;
}
