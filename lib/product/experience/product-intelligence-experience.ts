/**
 * PEX-3 — Product Intelligence Experience Contract
 * Shared read-only reader over frozen EPI GET /api/product/intelligence.
 * No new model / persistence / product-flow changes.
 */

import { GET } from "../../../app/api/product/intelligence/route";
import {
  PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT,
  PRODUCT_INTELLIGENCE_EXPOSURE_METHOD,
  type ProductIntelligenceView,
} from "../intelligence";

export const PEX_3_ID = "PEX-3" as const;
export const PEX_INTELLIGENCE_ENDPOINT =
  PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT;
export const PEX_INTELLIGENCE_METHOD = PRODUCT_INTELLIGENCE_EXPOSURE_METHOD;

export async function readProductIntelligenceExperience(): Promise<
  Pick<ProductIntelligenceView, "status" | "signals" | "attention">
> {
  const res = await GET();
  const view = (await res.json()) as ProductIntelligenceView;
  return {
    status: view.status,
    signals: view.signals,
    attention: view.attention,
  };
}
