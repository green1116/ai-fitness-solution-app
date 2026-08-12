/**
 * EPI-WP3 — Product Intelligence Exposure Surface
 * Read-only exposure contract over EPI-WP1 view and EPI-WP2 GET endpoint.
 * No new domain model / persistence / side effects / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getProductIntelligenceView,
  type ProductIntelligenceView,
} from "../product-intelligence-view";

export const EPI_WP3_ID = "EPI-WP3" as const;
export const PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT =
  "/api/product/intelligence" as const;
export const PRODUCT_INTELLIGENCE_EXPOSURE_METHOD = "GET" as const;

export type ProductIntelligenceExposure = Readonly<{
  id: typeof EPI_WP3_ID;
  endpoint: typeof PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT;
  method: typeof PRODUCT_INTELLIGENCE_EXPOSURE_METHOD;
  view: ProductIntelligenceView;
  scope: {
    readOnly: true;
    viewOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noFrozenLayerChanges: true;
  };
  fingerprint: string;
}>;

let cached: ProductIntelligenceExposure | null = null;

function cloneView(view: ProductIntelligenceView): ProductIntelligenceView {
  return {
    ...view,
    scope: { ...view.scope },
    signals: { ...view.signals },
    attention: { ...view.attention },
    recommendations: { ...view.recommendations },
  };
}

function cloneExposure(
  row: ProductIntelligenceExposure,
): ProductIntelligenceExposure {
  return {
    ...row,
    view: cloneView(row.view),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ProductIntelligenceExposure, "fingerprint">,
): string {
  return JSON.stringify({
    id: row.id,
    endpoint: row.endpoint,
    method: row.method,
    viewFingerprint: row.view.fingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ProductIntelligenceExposure, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveExposure(): ProductIntelligenceExposure {
  const withoutFp: Omit<ProductIntelligenceExposure, "fingerprint"> = {
    id: EPI_WP3_ID,
    endpoint: PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT,
    method: PRODUCT_INTELLIGENCE_EXPOSURE_METHOD,
    view: getProductIntelligenceView(),
    scope: {
      readOnly: true,
      viewOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noFrozenLayerChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildProductIntelligenceExposure(): ProductIntelligenceExposure {
  const out = deriveExposure();
  cached = cloneExposure(out);
  return cloneExposure(cached);
}

export function getProductIntelligenceExposure(): ProductIntelligenceExposure {
  if (!cached) {
    return buildProductIntelligenceExposure();
  }
  return cloneExposure(cached);
}

export function clearProductIntelligenceExposure(): void {
  cached = null;
}
