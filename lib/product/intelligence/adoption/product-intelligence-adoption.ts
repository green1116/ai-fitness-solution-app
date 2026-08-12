/**
 * EPI-WP4 — Product Intelligence Adoption Surface
 * Read-only adoption contract for existing products consuming EPI-WP3 exposure.
 * No new domain model / persistence / side effects / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getProductIntelligenceExposure,
  type ProductIntelligenceExposure,
} from "../exposure";

export const EPI_WP4_ID = "EPI-WP4" as const;

export const PRODUCT_INTELLIGENCE_ADOPTION_PRODUCTS = [
  { id: "quote", href: "/quote" },
  { id: "budget", href: "/budget" },
  { id: "tender", href: "/tender" },
] as const;

export type ProductIntelligenceAdoptionProduct =
  (typeof PRODUCT_INTELLIGENCE_ADOPTION_PRODUCTS)[number];

export type ProductIntelligenceAdoption = Readonly<{
  id: typeof EPI_WP4_ID;
  exposure: ProductIntelligenceExposure;
  products: typeof PRODUCT_INTELLIGENCE_ADOPTION_PRODUCTS;
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

let cached: ProductIntelligenceAdoption | null = null;

function cloneExposure(
  row: ProductIntelligenceExposure,
): ProductIntelligenceExposure {
  return {
    ...row,
    view: {
      ...row.view,
      scope: { ...row.view.scope },
      signals: { ...row.view.signals },
      attention: { ...row.view.attention },
      recommendations: { ...row.view.recommendations },
    },
    scope: { ...row.scope },
  };
}

function cloneAdoption(
  row: ProductIntelligenceAdoption,
): ProductIntelligenceAdoption {
  return {
    ...row,
    exposure: cloneExposure(row.exposure),
    products: row.products,
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ProductIntelligenceAdoption, "fingerprint">,
): string {
  return JSON.stringify({
    id: row.id,
    exposureFingerprint: row.exposure.fingerprint,
    products: row.products,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ProductIntelligenceAdoption, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveAdoption(): ProductIntelligenceAdoption {
  const withoutFp: Omit<ProductIntelligenceAdoption, "fingerprint"> = {
    id: EPI_WP4_ID,
    exposure: getProductIntelligenceExposure(),
    products: PRODUCT_INTELLIGENCE_ADOPTION_PRODUCTS,
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

export function buildProductIntelligenceAdoption(): ProductIntelligenceAdoption {
  const out = deriveAdoption();
  cached = cloneAdoption(out);
  return cloneAdoption(cached);
}

export function getProductIntelligenceAdoption(): ProductIntelligenceAdoption {
  if (!cached) {
    return buildProductIntelligenceAdoption();
  }
  return cloneAdoption(cached);
}

export function clearProductIntelligenceAdoption(): void {
  cached = null;
}
