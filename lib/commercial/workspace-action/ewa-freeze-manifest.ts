/**
 * EWA v1 Freeze — Workspace Action EWA-1~EWA-3 version metadata.
 * Product: enterprise-saas-workspace-action-v1.
 * Freeze only — no new WP / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1,
  getWfxFreeze,
} from "../../workflow/experience";
import {
  EWA_2_ID,
  WORKSPACE_ACTION_CONTEXT_VERSION,
  getWorkspaceActionContexts,
} from "./action-context";
import {
  EWA_3_ID,
  WORKSPACE_ACTION_OUTCOME_VERSION,
  getWorkspaceActionOutcomes,
} from "./action-outcome";
import {
  EWA_1_ID,
  WORKSPACE_ACTION_VERSION,
  getWorkspaceActions,
} from "./workspace-action";

export const EWA_FREEZE_ID = "EWA-Freeze" as const;
export const EWA_FREEZE_VERSION = "ewa-freeze-1.0.0" as const;
export const EWA_FREEZE_DATE = "2026-08-12" as const;
export const ENTERPRISE_SAAS_WORKSPACE_ACTION_V1 =
  "enterprise-saas-workspace-action-v1" as const;

export const EWA_COMPONENTS = [
  {
    id: EWA_1_ID,
    version: WORKSPACE_ACTION_VERSION,
    modulePath: "lib/commercial/workspace-action/workspace-action.ts",
    verifyScript: "scripts/verify-ewax-1-workspace-action.ts",
    status: "frozen" as const,
  },
  {
    id: EWA_2_ID,
    version: WORKSPACE_ACTION_CONTEXT_VERSION,
    modulePath: "lib/commercial/workspace-action/action-context.ts",
    verifyScript: "scripts/verify-ewax-2-action-context.ts",
    status: "frozen" as const,
  },
  {
    id: EWA_3_ID,
    version: WORKSPACE_ACTION_OUTCOME_VERSION,
    modulePath: "lib/commercial/workspace-action/action-outcome.ts",
    verifyScript: "scripts/verify-ewax-3-action-outcome.ts",
    status: "frozen" as const,
  },
] as const;

export type EwaFreeze = Readonly<{
  id: typeof EWA_FREEZE_ID;
  version: typeof EWA_FREEZE_VERSION;
  freezeDate: typeof EWA_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1;
  product: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_V1;
  components: typeof EWA_COMPONENTS;
  componentFingerprints: {
    "EWA-1": string;
    "EWA-2": string;
    "EWA-3": string;
  };
  wfxFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "EWA-1~EWA-3";
    chain: "ACTION -> CONTEXT -> OUTCOME -> FROZEN";
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

let cached: EwaFreeze | null = null;

function cloneFreeze(row: EwaFreeze): EwaFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EwaFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    wfxFreezeFingerprint: row.wfxFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EwaFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): EwaFreeze {
  const wfx = getWfxFreeze();
  const actions = getWorkspaceActions();
  const contexts = getWorkspaceActionContexts();
  const outcomes = getWorkspaceActionOutcomes();
  const withoutFp: Omit<EwaFreeze, "fingerprint"> = {
    id: EWA_FREEZE_ID,
    version: EWA_FREEZE_VERSION,
    freezeDate: EWA_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1,
    product: ENTERPRISE_SAAS_WORKSPACE_ACTION_V1,
    components: EWA_COMPONENTS,
    componentFingerprints: {
      "EWA-1": actions.fingerprint,
      "EWA-2": contexts.fingerprint,
      "EWA-3": outcomes.fingerprint,
    },
    wfxFreezeFingerprint: wfx.fingerprint,
    certification: "certified",
    scope: {
      components: "EWA-1~EWA-3",
      chain: "ACTION -> CONTEXT -> OUTCOME -> FROZEN",
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

export function buildEwaFreeze(): EwaFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEwaFreeze(): EwaFreeze {
  if (!cached) {
    return buildEwaFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEwaFreeze(): void {
  cached = null;
}
