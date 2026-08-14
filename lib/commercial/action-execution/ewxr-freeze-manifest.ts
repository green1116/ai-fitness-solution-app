/**
 * EWXR v1 Freeze — Workspace REVIEW Action EWXR-1 version metadata.
 * Product: enterprise-saas-workspace-review-action-v1.
 * Freeze only — EWXR-1 / REVIEW only. No executor / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_CONTROLLED_ACTION_V1,
  getEwerFreeze,
} from "./ewer-freeze-manifest";
import { getActionIntents } from "../action-intent/action-intent";
import {
  EWXR_1_ID,
  WORKSPACE_REVIEW_ACTION_VERSION,
  listWorkspaceReviewSurfaceItemIds,
  runWorkspaceReviewAction,
} from "./workspace-review-action";
import { SUPPORTED_CONTROLLED_ACTION_INTENT } from "./controlled-action";

export const EWXR_FREEZE_ID = "EWXR-Freeze" as const;
export const EWXR_FREEZE_VERSION = "ewxr-freeze-1.0.0" as const;
export const EWXR_FREEZE_DATE = "2026-08-14" as const;
export const ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1 =
  "enterprise-saas-workspace-review-action-v1" as const;

export const EWXR_COMPONENTS = [
  {
    id: EWXR_1_ID,
    version: WORKSPACE_REVIEW_ACTION_VERSION,
    modulePath: "lib/commercial/action-execution/workspace-review-action.ts",
    verifyScript: "scripts/verify-ewxr-1-workspace-review-action.ts",
    status: "frozen" as const,
  },
] as const;

export type EwxrFreeze = Readonly<{
  id: typeof EWXR_FREEZE_ID;
  version: typeof EWXR_FREEZE_VERSION;
  freezeDate: typeof EWXR_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_CONTROLLED_ACTION_V1;
  product: typeof ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1;
  components: typeof EWXR_COMPONENTS;
  componentFingerprints: {
    "EWXR-1": string;
  };
  ewerFreezeFingerprint: string;
  supportedIntent: typeof SUPPORTED_CONTROLLED_ACTION_INTENT;
  certification: "certified";
  scope: {
    components: "EWXR-1";
    chain: "CONTROLLED-ACTION -> WORKSPACE-REVIEW -> FROZEN";
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

let cached: EwxrFreeze | null = null;

function cloneFreeze(row: EwxrFreeze): EwxrFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EwxrFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    ewerFreezeFingerprint: row.ewerFreezeFingerprint,
    supportedIntent: row.supportedIntent,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EwxrFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function ewxr1Fingerprint(): string {
  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  const surfaceItemId = reviewIds[0] ?? "";
  const canonical = surfaceItemId
    ? runWorkspaceReviewAction(surfaceItemId).fingerprint
    : "missing-review-item";
  return createHash("sha256")
    .update(
      JSON.stringify({
        workPackageId: EWXR_1_ID,
        version: WORKSPACE_REVIEW_ACTION_VERSION,
        supportedIntent: SUPPORTED_CONTROLLED_ACTION_INTENT,
        reviewCount: getActionIntents().reviewCount,
        canonical,
      }),
    )
    .digest("hex");
}

function deriveFreeze(): EwxrFreeze {
  const ewer = getEwerFreeze();
  const withoutFp: Omit<EwxrFreeze, "fingerprint"> = {
    id: EWXR_FREEZE_ID,
    version: EWXR_FREEZE_VERSION,
    freezeDate: EWXR_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_CONTROLLED_ACTION_V1,
    product: ENTERPRISE_SAAS_WORKSPACE_REVIEW_ACTION_V1,
    components: EWXR_COMPONENTS,
    componentFingerprints: {
      "EWXR-1": ewxr1Fingerprint(),
    },
    ewerFreezeFingerprint: ewer.fingerprint,
    supportedIntent: SUPPORTED_CONTROLLED_ACTION_INTENT,
    certification: "certified",
    scope: {
      components: "EWXR-1",
      chain: "CONTROLLED-ACTION -> WORKSPACE-REVIEW -> FROZEN",
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

export function buildEwxrFreeze(): EwxrFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEwxrFreeze(): EwxrFreeze {
  if (!cached) {
    return buildEwxrFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEwxrFreeze(): void {
  cached = null;
}
