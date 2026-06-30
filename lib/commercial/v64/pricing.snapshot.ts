/**
 * V64 P2 — Pricing snapshot builder
 */
import { buildCommercialPricingConfig } from "./pricing.config";
import { getCommercialCurrencyMetadata } from "./pricing.currency";
import { lookupAllPlanPrices } from "./pricing.lookup";
import type { CommercialPricingSnapshot } from "./pricing.types";
import { V64_PRICING_LAYER_VERSION } from "./pricing.types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildCommercialPricingSnapshot(input?: {
  deploymentId?: string;
}): CommercialPricingSnapshot {
  const deploymentId = input?.deploymentId ?? "v64-pricing-layer-default";
  const plans = lookupAllPlanPrices();
  const currency = getCommercialCurrencyMetadata();
  const pricingConfig = buildCommercialPricingConfig({ deploymentId });

  return {
    version: V64_PRICING_LAYER_VERSION,
    snapshotId: `pricing-snapshot-${deploymentId}`,
    currency,
    generatedAt: new Date().toISOString(),
    plans,
    foundationVersion: V64_COMMERCIAL_FOUNDATION_VERSION,
    summary: [
      `pricing-snapshot tiers=${plans.length}`,
      `currency=${currency.code}`,
      `foundation=${pricingConfig.model}`,
    ].join(" "),
  };
}
