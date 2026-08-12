/**
 * PEX v1 Freeze — Product Experience PEX-1~PEX-3 version metadata.
 * Freeze only — no new capability / domain model / persistence / product-flow changes.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1,
  getEpiFreeze,
} from "../intelligence";
import {
  PEX_3_ID,
  PEX_INTELLIGENCE_ENDPOINT,
  PEX_INTELLIGENCE_METHOD,
} from "./product-intelligence-experience";

export const PEX_FREEZE_ID = "PEX-Freeze" as const;
export const PEX_FREEZE_VERSION = "pex-freeze-1.0.0" as const;
export const PEX_FREEZE_DATE = "2026-08-12" as const;
export const PEX_1_ID = "PEX-1" as const;
export const PEX_2_ID = "PEX-2" as const;
export const ENTERPRISE_SAAS_PRODUCT_EXPERIENCE_V1 =
  "enterprise-saas-product-experience-v1" as const;

export const PEX_COMPONENTS = [
  {
    id: PEX_1_ID,
    version: "status,signals,attention",
    modulePath: "app/(product)/layout.tsx",
    verifyScript: "scripts/verify-pex-v1-freeze.ts",
    status: "frozen" as const,
  },
  {
    id: PEX_2_ID,
    version: "quote,budget,tender",
    modulePath: "app/(product)/quote/page.tsx",
    verifyScript: "scripts/verify-pex-v1-freeze.ts",
    status: "frozen" as const,
  },
  {
    id: PEX_3_ID,
    version: `${PEX_INTELLIGENCE_METHOD} ${PEX_INTELLIGENCE_ENDPOINT}`,
    modulePath: "lib/product/experience/product-intelligence-experience.ts",
    verifyScript: "scripts/verify-pex-wp3.ts",
    status: "frozen" as const,
  },
] as const;

export type PexFreeze = Readonly<{
  id: typeof PEX_FREEZE_ID;
  version: typeof PEX_FREEZE_VERSION;
  freezeDate: typeof PEX_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1;
  product: typeof ENTERPRISE_SAAS_PRODUCT_EXPERIENCE_V1;
  components: typeof PEX_COMPONENTS;
  componentFingerprints: {
    "PEX-1": string;
    "PEX-2": string;
    "PEX-3": string;
  };
  epiFreezeFingerprint: string;
  certification: "certified";
  scope: {
    components: "PEX-1~PEX-3";
    chain: "LAYOUT -> PAGES -> READER -> FROZEN";
    freezeOnly: true;
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noProductFlowChanges: true;
  };
  fingerprint: string;
}>;

let cached: PexFreeze | null = null;

function cloneFreeze(row: PexFreeze): PexFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<PexFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    epiFreezeFingerprint: row.epiFreezeFingerprint,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<PexFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): PexFreeze {
  const epi = getEpiFreeze();
  const viewFp = epi.componentFingerprints["EPI-WP1"];
  const withoutFp: Omit<PexFreeze, "fingerprint"> = {
    id: PEX_FREEZE_ID,
    version: PEX_FREEZE_VERSION,
    freezeDate: PEX_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1,
    product: ENTERPRISE_SAAS_PRODUCT_EXPERIENCE_V1,
    components: PEX_COMPONENTS,
    componentFingerprints: {
      "PEX-1": viewFp,
      "PEX-2": viewFp,
      "PEX-3": viewFp,
    },
    epiFreezeFingerprint: epi.fingerprint,
    certification: "certified",
    scope: {
      components: "PEX-1~PEX-3",
      chain: "LAYOUT -> PAGES -> READER -> FROZEN",
      freezeOnly: true,
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noProductFlowChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildPexFreeze(): PexFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getPexFreeze(): PexFreeze {
  if (!cached) {
    return buildPexFreeze();
  }
  return cloneFreeze(cached);
}

export function clearPexFreeze(): void {
  cached = null;
}
