/**
 * V80 PRODUCT P1 — Productization entry
 */
export {
  assertProductizationPass,
  buildProductization,
} from "./productization.builder";
export {
  getJourneyByKey,
  isProductJourneyMapComplete,
  PRODUCT_JOURNEY_FLOWS,
} from "./product.journey.spec";
export {
  getOnboardingActivationStep,
  isProductOnboardingComplete,
  PRODUCT_ONBOARDING_FLOW,
} from "./product.onboarding.spec";
export {
  getPackagingByPlan,
  isProductPackagingComplete,
  PRODUCT_MODULE_PACKS,
  PRODUCT_PACKAGING_TIERS,
} from "./product.packaging.spec";
export {
  getPricingByPlan,
  isProductPricingComplete,
  PRODUCT_FEATURE_API_MAP,
  PRODUCT_PRICING_TIERS,
} from "./product.pricing.spec";
export {
  V80_PRODUCT_PRODUCTIZATION_FREEZE_VERSION,
  V80_PRODUCT_PRODUCTIZATION_VERSION,
} from "./productization.types";
export type { ProductizationReport } from "./productization.types";

import { buildProductization } from "./productization.builder";
import type { ProductizationReport } from "./productization.types";

export function runProductization(input?: { deploymentId?: string }): ProductizationReport {
  return buildProductization(input);
}

export function formatProductizationSummary(report: ProductizationReport): string {
  return [
    "V80 PRODUCT Productization",
    `  ready: ${report.productizationReady}`,
    `  score: ${report.readinessScore}/100`,
    `  code release: ${report.codeReleaseReady}`,
    `  tiers: ${report.manifest.packagingCount}`,
    `  journeys: ${report.manifest.journeyCount}`,
    `  onboarding steps: ${report.manifest.onboardingStepCount}`,
  ].join("\n");
}
