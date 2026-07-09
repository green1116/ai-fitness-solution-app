/**
 * V80 PRODUCT P1 — Productization builder (read-only CODE P4 + APP P1 consumer)
 */
import { buildCodeRelease } from "@/lib/code/v80/release.entry";
import { V80_CODE_RELEASE_VERSION } from "@/lib/code/v80/release.types";
import {
  isProductJourneyMapComplete,
  PRODUCT_JOURNEY_FLOWS,
} from "./product.journey.spec";
import {
  isProductOnboardingComplete,
  PRODUCT_ONBOARDING_FLOW,
} from "./product.onboarding.spec";
import {
  isProductPackagingComplete,
  PRODUCT_MODULE_PACKS,
  PRODUCT_PACKAGING_TIERS,
} from "./product.packaging.spec";
import {
  isProductPricingComplete,
  PRODUCT_PRICING_TIERS,
} from "./product.pricing.spec";
import type { ProductizationManifest, ProductizationReport } from "./productization.types";
import {
  V80_PRODUCT_PRODUCTIZATION_FREEZE_VERSION,
  V80_PRODUCT_PRODUCTIZATION_VERSION,
} from "./productization.types";

export function buildProductizationManifest(input: {
  codeReleaseReady: boolean;
}): ProductizationManifest {
  const packagingComplete = isProductPackagingComplete();
  const journeyComplete = isProductJourneyMapComplete();
  const pricingComplete = isProductPricingComplete();
  const onboardingComplete = isProductOnboardingComplete();

  const productizationComplete =
    input.codeReleaseReady &&
    packagingComplete &&
    journeyComplete &&
    pricingComplete &&
    onboardingComplete;

  return {
    version: V80_PRODUCT_PRODUCTIZATION_VERSION,
    codeReleaseVersion: V80_CODE_RELEASE_VERSION,
    packagingCount: PRODUCT_PACKAGING_TIERS.length,
    journeyCount: PRODUCT_JOURNEY_FLOWS.length,
    pricingTierCount: PRODUCT_PRICING_TIERS.length,
    onboardingStepCount: PRODUCT_ONBOARDING_FLOW.length,
    productizationComplete,
    summary: `productization complete=${productizationComplete} tiers=${PRODUCT_PACKAGING_TIERS.length}`,
  };
}

export function buildProductization(input?: { deploymentId?: string }): ProductizationReport {
  const deploymentId = input?.deploymentId ?? "v80-product-default";
  const release = buildCodeRelease({ deploymentId });
  const manifest = buildProductizationManifest({ codeReleaseReady: release.releaseReady });

  const productizationReady = release.releaseReady && manifest.productizationComplete;

  return {
    version: V80_PRODUCT_PRODUCTIZATION_VERSION,
    freezeVersion: V80_PRODUCT_PRODUCTIZATION_FREEZE_VERSION,
    reportId: `productization-${deploymentId}`,
    codeReleaseReady: release.releaseReady,
    manifest,
    packaging: PRODUCT_PACKAGING_TIERS,
    modules: PRODUCT_MODULE_PACKS,
    journeys: PRODUCT_JOURNEY_FLOWS,
    pricing: PRODUCT_PRICING_TIERS,
    onboarding: PRODUCT_ONBOARDING_FLOW,
    productizationReady,
    readinessScore: productizationReady ? 100 : 0,
    summary: `productization ready=${productizationReady} code=${release.releaseReady}`,
  };
}

export function assertProductizationPass(
  report: ProductizationReport,
): asserts report is ProductizationReport & { productizationReady: true } {
  if (!report.productizationReady) {
    throw new Error(`V80 PRODUCT productization not ready: ${report.summary}`);
  }
}
