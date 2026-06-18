import { CP_MIN_DELIVERABLE_COUNT, CP_MIN_PRODUCT_COUNT } from "./shared/constants";
import type { ProductPackagingValidation } from "./shared/types";
import { assertProductCatalogReady, buildProductCatalog } from "./product-catalog/product-catalog";
import { buildDeliveryPackage } from "./product-packages/package-builder";

const SAMPLE_INPUT = {
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
};

let cachedValidation: ProductPackagingValidation | undefined;

export function validateProductPackagingFoundation(): ProductPackagingValidation {
  if (cachedValidation) return cachedValidation;

  const catalog = buildProductCatalog();
  const samplePackage = buildDeliveryPackage(SAMPLE_INPUT);
  const catalogReady = assertProductCatalogReady();
  const deliverableCount = samplePackage.deliverables.length;

  const valid =
    catalog.count >= CP_MIN_PRODUCT_COUNT &&
    deliverableCount >= CP_MIN_DELIVERABLE_COUNT &&
    catalogReady &&
    samplePackage.pricing.suggestedPriceCny >= samplePackage.pricing.priceMinCny &&
    samplePackage.pricing.suggestedPriceCny <= samplePackage.pricing.priceMaxCny &&
    samplePackage.contract.paymentSchedule.length === 2;

  cachedValidation = {
    valid,
    productCount: catalog.count,
    deliverableCount,
    catalogReady,
    summary: [
      `products=${catalog.count}`,
      `deliverables=${deliverableCount}`,
      `catalogReady=${catalogReady}`,
      `valid=${valid}`,
    ].join(" "),
  };

  return cachedValidation;
}
