/**
 * V64 P2 — Plan price normalization (display + reference; no checkout mutation)
 */
import { commercialTierAmountCents } from "@/lib/commercial/pricing";
import { PRICING_TIERS } from "@/lib/growth/conversion/pricing.strategy";
import { getPricingForTier } from "@/lib/productization/catalog";
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";

import {
  PRODUCT_TO_SAAS_PLAN,
  PRODUCT_TO_USER_TIER,
  resolveProductTierForSaasPlan,
  USER_TO_PRODUCT_TIER,
} from "./capability.map";
import { DEFAULT_COMMERCIAL_CURRENCY, formatCnyFromCents, formatCnyYuan } from "./pricing.currency";
import type { NormalizedPlanPrice, PlanPriceKind } from "./pricing.types";

const ALL_PRODUCT_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

function oneTimeReferenceCents(userTier: UserTier): number | null {
  if (userTier === "pro") return commercialTierAmountCents("pro");
  if (userTier === "enterprise") return commercialTierAmountCents("enterprise");
  return null;
}

export function normalizePlanPrice(productTier: ProductTier): NormalizedPlanPrice {
  const saasPlan = PRODUCT_TO_SAAS_PLAN[productTier];
  const userTier = PRODUCT_TO_USER_TIER[productTier];
  const display = PRICING_TIERS[saasPlan];
  const catalog = getPricingForTier(productTier);
  const referencePriceCents = oneTimeReferenceCents(userTier);

  const priceKinds: PlanPriceKind[] = ["subscription_monthly", "catalog_custom"];
  if (referencePriceCents != null) {
    priceKinds.push("one_time_unlock");
  }

  return {
    productTier,
    saasPlan,
    userTier,
    currency: DEFAULT_COMMERCIAL_CURRENCY,
    displayPriceCny: display.monthlyPriceCny,
    displayPriceLabel: formatCnyYuan(display.monthlyPriceCny, { suffix: "/月" }),
    referencePriceCents,
    referencePriceLabel:
      referencePriceCents != null ? formatCnyFromCents(referencePriceCents) : null,
    catalogReferenceLabel: catalog.displayPrice,
    priceKinds,
  };
}

export function normalizeAllPlanPrices(): NormalizedPlanPrice[] {
  return ALL_PRODUCT_TIERS.map(normalizePlanPrice);
}

export function normalizePlanPriceForSaasPlan(plan: SaasPlan): NormalizedPlanPrice {
  return normalizePlanPrice(resolveProductTierForSaasPlan(plan));
}

export function normalizePlanPriceForUserTier(tier: UserTier): NormalizedPlanPrice | null {
  const productTier = USER_TO_PRODUCT_TIER[tier];
  if (!productTier) return null;
  return normalizePlanPrice(productTier);
}
