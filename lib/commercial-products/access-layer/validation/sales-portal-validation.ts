import {
  CP_MIN_PORTAL_PRODUCT_COUNT,
  CP_QUOTE_API_PATH,
} from "../shared/constants";
import type { SalesPortalValidation } from "../shared/types";
import { buildSalesPortalView } from "../portal/portal-builder";
import { buildSalesPortalRegistry } from "../portal/portal-registry";

export function validateSalesPortal(): SalesPortalValidation {
  const registry = buildSalesPortalRegistry();
  const view = buildSalesPortalView();

  const productCardsReady = view.products.every(
    (product) =>
      product.sku &&
      product.name &&
      product.description &&
      product.priceMinCny > 0 &&
      product.priceMaxCny >= product.priceMinCny &&
      product.deliverableCount > 0 &&
      product.defaultSla,
  );

  const quoteApiRegistered = view.quoteApiPath === CP_QUOTE_API_PATH;
  const productCount = registry.count;

  const valid =
    productCount >= CP_MIN_PORTAL_PRODUCT_COUNT &&
    quoteApiRegistered &&
    productCardsReady;

  return {
    valid,
    productCount,
    quoteApiRegistered,
    productCardsReady,
    summary: [
      `productCount=${productCount}`,
      `quoteApiRegistered=${quoteApiRegistered}`,
      `productCardsReady=${productCardsReady}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
