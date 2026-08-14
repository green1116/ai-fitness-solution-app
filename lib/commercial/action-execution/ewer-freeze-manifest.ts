/**
 * EWER v1 Freeze — Controlled Real Action EWER-1 version metadata.
 * Product: enterprise-saas-controlled-action-v1.
 * Freeze only — EWER-1 / REVIEW only. No execution engine / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_ACTION_EXECUTION_BOUNDARY_V1,
  getEwebFreeze,
} from "./eweb-freeze-manifest";
import { getActionExecutionRequests } from "./action-execution";
import {
  CONTROLLED_ACTION_API,
  CONTROLLED_ACTION_VERSION,
  EWER_1_ID,
  SUPPORTED_CONTROLLED_ACTION_INTENT,
  executeControlledAction,
} from "./controlled-action";

export const EWER_FREEZE_ID = "EWER-Freeze" as const;
export const EWER_FREEZE_VERSION = "ewer-freeze-1.0.0" as const;
export const EWER_FREEZE_DATE = "2026-08-14" as const;
export const ENTERPRISE_SAAS_CONTROLLED_ACTION_V1 =
  "enterprise-saas-controlled-action-v1" as const;

export const EWER_COMPONENTS = [
  {
    id: EWER_1_ID,
    version: CONTROLLED_ACTION_VERSION,
    modulePath: "lib/commercial/action-execution/controlled-action.ts",
    verifyScript: "scripts/verify-ewer-1-controlled-action.ts",
    status: "frozen" as const,
  },
] as const;

export type EwerFreeze = Readonly<{
  id: typeof EWER_FREEZE_ID;
  version: typeof EWER_FREEZE_VERSION;
  freezeDate: typeof EWER_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_ACTION_EXECUTION_BOUNDARY_V1;
  product: typeof ENTERPRISE_SAAS_CONTROLLED_ACTION_V1;
  components: typeof EWER_COMPONENTS;
  componentFingerprints: {
    "EWER-1": string;
  };
  ewebFreezeFingerprint: string;
  supportedIntent: typeof SUPPORTED_CONTROLLED_ACTION_INTENT;
  api: typeof CONTROLLED_ACTION_API;
  certification: "certified";
  scope: {
    components: "EWER-1";
    chain: "EXECUTION-REQUEST -> CONTROLLED-ACTION -> FROZEN";
    supportedAction: "REVIEW";
    freezeOnly: true;
    singleActionType: true;
    noExecutionEngine: true;
    noPersistence: true;
    noPrisma: true;
    noRuntimeSideEffects: true;
    noFrozenLayerChanges: true;
  };
  fingerprint: string;
}>;

let cached: EwerFreeze | null = null;

function cloneFreeze(row: EwerFreeze): EwerFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EwerFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    ewebFreezeFingerprint: row.ewebFreezeFingerprint,
    supportedIntent: row.supportedIntent,
    api: row.api,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EwerFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function ewer1Fingerprint(): string {
  const requests = getActionExecutionRequests();
  const readyReview = requests.records.find(
    (row) =>
      row.requestState === "READY" &&
      row.intent === SUPPORTED_CONTROLLED_ACTION_INTENT,
  );
  const canonical = readyReview
    ? executeControlledAction(readyReview).fingerprint
    : "missing-ready-review";
  return createHash("sha256")
    .update(
      JSON.stringify({
        workPackageId: EWER_1_ID,
        version: CONTROLLED_ACTION_VERSION,
        supportedIntent: SUPPORTED_CONTROLLED_ACTION_INTENT,
        api: CONTROLLED_ACTION_API,
        canonical,
      }),
    )
    .digest("hex");
}

function deriveFreeze(): EwerFreeze {
  const eweb = getEwebFreeze();
  const withoutFp: Omit<EwerFreeze, "fingerprint"> = {
    id: EWER_FREEZE_ID,
    version: EWER_FREEZE_VERSION,
    freezeDate: EWER_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_ACTION_EXECUTION_BOUNDARY_V1,
    product: ENTERPRISE_SAAS_CONTROLLED_ACTION_V1,
    components: EWER_COMPONENTS,
    componentFingerprints: {
      "EWER-1": ewer1Fingerprint(),
    },
    ewebFreezeFingerprint: eweb.fingerprint,
    supportedIntent: SUPPORTED_CONTROLLED_ACTION_INTENT,
    api: CONTROLLED_ACTION_API,
    certification: "certified",
    scope: {
      components: "EWER-1",
      chain: "EXECUTION-REQUEST -> CONTROLLED-ACTION -> FROZEN",
      supportedAction: "REVIEW",
      freezeOnly: true,
      singleActionType: true,
      noExecutionEngine: true,
      noPersistence: true,
      noPrisma: true,
      noRuntimeSideEffects: true,
      noFrozenLayerChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildEwerFreeze(): EwerFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEwerFreeze(): EwerFreeze {
  if (!cached) {
    return buildEwerFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEwerFreeze(): void {
  cached = null;
}
