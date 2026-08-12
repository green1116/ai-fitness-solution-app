/**
 * EPI-WP5 — Product Intelligence Feedback Surface
 * Deterministic read-only feedback projection from EPI-WP4 adoption.
 * No new domain model / persistence / side effects / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getProductIntelligenceAdoption,
  type ProductIntelligenceAdoption,
} from "../adoption";
import type { ProductIntelligenceView } from "../product-intelligence-view";

export const EPI_WP5_ID = "EPI-WP5" as const;

export type ProductIntelligenceFeedback = Readonly<{
  id: typeof EPI_WP5_ID;
  adoption: ProductIntelligenceAdoption;
  status: ProductIntelligenceView["status"];
  signals: ProductIntelligenceView["signals"];
  attention: ProductIntelligenceView["attention"];
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

let cached: ProductIntelligenceFeedback | null = null;

function cloneAdoption(
  row: ProductIntelligenceAdoption,
): ProductIntelligenceAdoption {
  return {
    ...row,
    exposure: {
      ...row.exposure,
      view: {
        ...row.exposure.view,
        scope: { ...row.exposure.view.scope },
        signals: { ...row.exposure.view.signals },
        attention: { ...row.exposure.view.attention },
        recommendations: { ...row.exposure.view.recommendations },
      },
      scope: { ...row.exposure.scope },
    },
    products: row.products,
    scope: { ...row.scope },
  };
}

function cloneFeedback(
  row: ProductIntelligenceFeedback,
): ProductIntelligenceFeedback {
  return {
    ...row,
    adoption: cloneAdoption(row.adoption),
    signals: { ...row.signals },
    attention: { ...row.attention },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ProductIntelligenceFeedback, "fingerprint">,
): string {
  return JSON.stringify({
    id: row.id,
    adoptionFingerprint: row.adoption.fingerprint,
    status: row.status,
    signals: row.signals,
    attention: row.attention,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ProductIntelligenceFeedback, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFeedback(): ProductIntelligenceFeedback {
  const adoption = getProductIntelligenceAdoption();
  const view = adoption.exposure.view;
  const withoutFp: Omit<ProductIntelligenceFeedback, "fingerprint"> = {
    id: EPI_WP5_ID,
    adoption,
    status: view.status,
    signals: { ...view.signals },
    attention: { ...view.attention },
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

export function buildProductIntelligenceFeedback(): ProductIntelligenceFeedback {
  const out = deriveFeedback();
  cached = cloneFeedback(out);
  return cloneFeedback(cached);
}

export function getProductIntelligenceFeedback(): ProductIntelligenceFeedback {
  if (!cached) {
    return buildProductIntelligenceFeedback();
  }
  return cloneFeedback(cached);
}

export function clearProductIntelligenceFeedback(): void {
  cached = null;
}
