/**
 * EPI v1 Freeze — Product Intelligence WP1~WP5 version metadata.
 * Freeze only — no new capability / domain model / persistence / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  EPI_WP4_ID,
  getProductIntelligenceAdoption,
} from "./adoption";
import {
  EPI_WP3_ID,
  PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT,
  PRODUCT_INTELLIGENCE_EXPOSURE_METHOD,
  getProductIntelligenceExposure,
} from "./exposure";
import {
  EPI_WP5_ID,
  getProductIntelligenceFeedback,
} from "./feedback";
import {
  ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1,
  EPI_WP1_ID,
  PRODUCT_INTELLIGENCE_VIEW_VERSION,
  getProductIntelligenceView,
} from "./product-intelligence-view";

export const EPI_FREEZE_ID = "EPI-Freeze" as const;
export const EPI_FREEZE_VERSION = "epi-freeze-1.0.0" as const;
export const EPI_FREEZE_DATE = "2026-08-12" as const;
export const EPI_WP2_ID = "EPI-WP2" as const;
export const ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1 =
  "enterprise-saas-product-intelligence-v1" as const;

export const EPI_COMPONENTS = [
  {
    id: EPI_WP1_ID,
    version: PRODUCT_INTELLIGENCE_VIEW_VERSION,
    modulePath: "lib/product/intelligence/product-intelligence-view.ts",
    verifyScript: "scripts/verify-epi-wp1.ts",
    status: "frozen" as const,
  },
  {
    id: EPI_WP2_ID,
    version: `${PRODUCT_INTELLIGENCE_EXPOSURE_METHOD} ${PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT}`,
    modulePath: "app/api/product/intelligence/route.ts",
    verifyScript: "scripts/verify-epi-wp2.ts",
    status: "frozen" as const,
  },
  {
    id: EPI_WP3_ID,
    version: PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT,
    modulePath:
      "lib/product/intelligence/exposure/product-intelligence-exposure.ts",
    verifyScript: "scripts/verify-epi-wp3.ts",
    status: "frozen" as const,
  },
  {
    id: EPI_WP4_ID,
    version: "quote,budget,tender",
    modulePath:
      "lib/product/intelligence/adoption/product-intelligence-adoption.ts",
    verifyScript: "scripts/verify-epi-wp4.ts",
    status: "frozen" as const,
  },
  {
    id: EPI_WP5_ID,
    version: "status,signals,attention",
    modulePath:
      "lib/product/intelligence/feedback/product-intelligence-feedback.ts",
    verifyScript: "scripts/verify-epi-wp5.ts",
    status: "frozen" as const,
  },
] as const;

export type EpiFreeze = Readonly<{
  id: typeof EPI_FREEZE_ID;
  version: typeof EPI_FREEZE_VERSION;
  freezeDate: typeof EPI_FREEZE_DATE;
  baseline: typeof ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1;
  product: typeof ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1;
  components: typeof EPI_COMPONENTS;
  componentFingerprints: {
    "EPI-WP1": string;
    "EPI-WP2": string;
    "EPI-WP3": string;
    "EPI-WP4": string;
    "EPI-WP5": string;
  };
  certification: "certified";
  scope: {
    components: "EPI-WP1~EPI-WP5";
    chain: "VIEW -> API -> EXPOSURE -> ADOPTION -> FEEDBACK -> FROZEN";
    freezeOnly: true;
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noFrozenLayerChanges: true;
  };
  fingerprint: string;
}>;

let cached: EpiFreeze | null = null;

function cloneFreeze(row: EpiFreeze): EpiFreeze {
  return {
    ...row,
    components: row.components,
    componentFingerprints: { ...row.componentFingerprints },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EpiFreeze, "fingerprint">): string {
  return JSON.stringify({
    id: row.id,
    version: row.version,
    freezeDate: row.freezeDate,
    baseline: row.baseline,
    product: row.product,
    components: row.components,
    componentFingerprints: row.componentFingerprints,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EpiFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFreeze(): EpiFreeze {
  const view = getProductIntelligenceView();
  const exposure = getProductIntelligenceExposure();
  const adoption = getProductIntelligenceAdoption();
  const feedback = getProductIntelligenceFeedback();
  const withoutFp: Omit<EpiFreeze, "fingerprint"> = {
    id: EPI_FREEZE_ID,
    version: EPI_FREEZE_VERSION,
    freezeDate: EPI_FREEZE_DATE,
    baseline: ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1,
    product: ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1,
    components: EPI_COMPONENTS,
    componentFingerprints: {
      "EPI-WP1": view.fingerprint,
      "EPI-WP2": view.fingerprint,
      "EPI-WP3": exposure.fingerprint,
      "EPI-WP4": adoption.fingerprint,
      "EPI-WP5": feedback.fingerprint,
    },
    certification: "certified",
    scope: {
      components: "EPI-WP1~EPI-WP5",
      chain: "VIEW -> API -> EXPOSURE -> ADOPTION -> FEEDBACK -> FROZEN",
      freezeOnly: true,
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noFrozenLayerChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildEpiFreeze(): EpiFreeze {
  const out = deriveFreeze();
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEpiFreeze(): EpiFreeze {
  if (!cached) {
    return buildEpiFreeze();
  }
  return cloneFreeze(cached);
}

export function clearEpiFreeze(): void {
  cached = null;
}
