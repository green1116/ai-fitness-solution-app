/**
 * WFX v1 Freeze — Workflow Experience WFX-1~WFX-2 version metadata.
 * Freeze only — no new capability / domain model / persistence / project-flow changes.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_PRODUCT_EXPERIENCE_V1,
  getPexFreeze,
} from "../../product/experience";

export const WFX_FREEZE_ID = "WFX-Freeze" as const;
export const WFX_FREEZE_VERSION = "wfx-freeze-1.0.0" as const;
export const WFX_FREEZE_DATE = "2026-08-12" as const;
export const WFX_1_ID = "WFX-1" as const;
export const WFX_2_ID = "WFX-2" as const;
export const ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1 =
  "enterprise-saas-workflow-experience-v1" as const;

export const WFX_COMPONENTS = [
  {
    id: WFX_1_ID,
    version: "status,signals,attention",
    modulePath: "app/(workspace)/layout.tsx",
    verifyScript: "scripts/verify-wfx-v1-freeze.ts",
    status: "frozen" as const,
  },
  {
    id: WFX_2_ID,
    version: "projects,project-detail",
    modulePath: "app/(workspace)/projects/page.tsx",
    verifyScript: "scripts/verify-wfx-v1-freeze.ts",
    status: "frozen" as const,
  },
] as const;

export type WfxFreeze = Readonly<{
  id: typeof WFX_FREEZE_ID;
  version: typeof WFX_FREEZE_VERSION;
  freezeDate: typeof WFX_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_PRODUCT_EXPERIENCE_V1;
  product: typeof ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1;
  components: typeof WFX_COMPONENTS;
  componentFingerprints: {
    "WFX-1": string;
    "WFX-2": string;
  };
  pexFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "WFX-1~WFX-2";
    chain: "LAYOUT -> PROJECTS -> FROZEN";
    freezeOnly: true;
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noProjectFlowChanges: true;
  };
  fingerprint: string;
}>;

let cached: WfxFreeze | null = null;

function cloneFreeze(row: WfxFreeze): WfxFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<WfxFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    pexFreezeFingerprint: row.pexFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<WfxFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): WfxFreeze {
  const pex = getPexFreeze();
  const viewFp = pex.componentFingerprints["PEX-1"];
  const withoutFp: Omit<WfxFreeze, "fingerprint"> = {
    id: WFX_FREEZE_ID,
    version: WFX_FREEZE_VERSION,
    freezeDate: WFX_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_PRODUCT_EXPERIENCE_V1,
    product: ENTERPRISE_SAAS_WORKFLOW_EXPERIENCE_V1,
    components: WFX_COMPONENTS,
    componentFingerprints: {
      "WFX-1": viewFp,
      "WFX-2": viewFp,
    },
    pexFreezeFingerprint: pex.fingerprint,
    certification: "certified",
    scope: {
      components: "WFX-1~WFX-2",
      chain: "LAYOUT -> PROJECTS -> FROZEN",
      freezeOnly: true,
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noProjectFlowChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildWfxFreeze(): WfxFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getWfxFreeze(): WfxFreeze {
  if (!cached) {
    return buildWfxFreeze();
  }
  return cloneFreeze(cached);
}

export function clearWfxFreeze(): void {
  cached = null;
}
