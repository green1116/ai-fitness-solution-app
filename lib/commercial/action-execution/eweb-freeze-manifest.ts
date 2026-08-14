/**
 * EWEB v1 Freeze — Action Execution Boundary EWEB-1 version metadata.
 * Product: enterprise-saas-action-execution-boundary-v1.
 * Freeze only — no execution / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1,
  getEwiFreeze,
} from "../action-intent/ewi-freeze-manifest";
import {
  ACTION_EXECUTION_VERSION,
  EWEB_1_ID,
  getActionExecutionRequests,
} from "./action-execution";

export const EWEB_FREEZE_ID = "EWEB-Freeze" as const;
export const EWEB_FREEZE_VERSION = "eweb-freeze-1.0.0" as const;
export const EWEB_FREEZE_DATE = "2026-08-14" as const;
export const ENTERPRISE_SAAS_ACTION_EXECUTION_BOUNDARY_V1 =
  "enterprise-saas-action-execution-boundary-v1" as const;

export const EWEB_COMPONENTS = [
  {
    id: EWEB_1_ID,
    version: ACTION_EXECUTION_VERSION,
    modulePath: "lib/commercial/action-execution/action-execution.ts",
    verifyScript: "scripts/verify-eweb-1-action-execution.ts",
    status: "frozen" as const,
  },
] as const;

export type EwebFreeze = Readonly<{
  id: typeof EWEB_FREEZE_ID;
  version: typeof EWEB_FREEZE_VERSION;
  freezeDate: typeof EWEB_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1;
  product: typeof ENTERPRISE_SAAS_ACTION_EXECUTION_BOUNDARY_V1;
  components: typeof EWEB_COMPONENTS;
  componentFingerprints: {
    "EWEB-1": string;
  };
  ewiFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "EWEB-1";
    chain: "INTENT -> EXECUTION-REQUEST -> FROZEN";
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

let cached: EwebFreeze | null = null;

function cloneFreeze(row: EwebFreeze): EwebFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EwebFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    ewiFreezeFingerprint: row.ewiFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EwebFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): EwebFreeze {
  const ewi = getEwiFreeze();
  const requests = getActionExecutionRequests();
  const withoutFp: Omit<EwebFreeze, "fingerprint"> = {
    id: EWEB_FREEZE_ID,
    version: EWEB_FREEZE_VERSION,
    freezeDate: EWEB_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1,
    product: ENTERPRISE_SAAS_ACTION_EXECUTION_BOUNDARY_V1,
    components: EWEB_COMPONENTS,
    componentFingerprints: {
      "EWEB-1": requests.fingerprint,
    },
    ewiFreezeFingerprint: ewi.fingerprint,
    certification: "certified",
    scope: {
      components: "EWEB-1",
      chain: "INTENT -> EXECUTION-REQUEST -> FROZEN",
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

export function buildEwebFreeze(): EwebFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEwebFreeze(): EwebFreeze {
  if (!cached) {
    return buildEwebFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEwebFreeze(): void {
  cached = null;
}
