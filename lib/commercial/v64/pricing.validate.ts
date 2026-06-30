/**
 * V64 P2 — Pricing validation (read-only invariants)
 */
import { PRICING_TIERS } from "@/lib/growth/conversion/pricing.strategy";
import { commercialTierAmountCents } from "@/lib/commercial/pricing";

import { buildCommercialPricingConfig } from "./pricing.config";
import { buildCommercialPricingSnapshot } from "./pricing.snapshot";
import type { CommercialPricingSnapshot, CommercialPricingValidation } from "./pricing.types";

function validateSnapshot(snapshot: CommercialPricingSnapshot): CommercialPricingValidation {
  const currencyOk =
    snapshot.currency.code === "CNY" &&
    snapshot.currency.symbol === "¥" &&
    snapshot.currency.minorUnit === 2;

  const plansOk = snapshot.plans.length === 3;

  const displayPricesOk = snapshot.plans.every((plan) => {
    const expected = PRICING_TIERS[plan.saasPlan].monthlyPriceCny;
    return plan.displayPriceCny === expected && plan.displayPriceLabel.includes("¥");
  });

  const referencePricesOk = snapshot.plans.every((plan) => {
    if (plan.userTier === "free") {
      return plan.referencePriceCents === null && plan.referencePriceLabel === null;
    }
    const expected =
      plan.userTier === "pro"
        ? commercialTierAmountCents("pro")
        : commercialTierAmountCents("enterprise");
    return plan.referencePriceCents === expected && plan.referencePriceLabel != null;
  });

  const catalogLabelsOk = snapshot.plans.every(
    (plan) => plan.catalogReferenceLabel === "Custom pricing",
  );

  const foundationConfig = buildCommercialPricingConfig();
  const backwardCompatible =
    foundationConfig.entries.length === 3 &&
    foundationConfig.entries.every((entry) => entry.catalogDisplayPrice === "Custom pricing");

  const pricingOk =
    currencyOk &&
    plansOk &&
    displayPricesOk &&
    referencePricesOk &&
    catalogLabelsOk &&
    backwardCompatible;

  return {
    currencyOk,
    plansOk,
    displayPricesOk,
    referencePricesOk,
    catalogLabelsOk,
    backwardCompatible,
    pricingOk,
  };
}

export function validateCommercialPricing(input?: {
  deploymentId?: string;
}): CommercialPricingValidation {
  const snapshot = buildCommercialPricingSnapshot(input);
  return validateSnapshot(snapshot);
}

export function validateCommercialPricingSnapshot(
  snapshot: CommercialPricingSnapshot,
): CommercialPricingValidation {
  return validateSnapshot(snapshot);
}
