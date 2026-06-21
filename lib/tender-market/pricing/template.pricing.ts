/**
 * V64+ — Template pricing (metrics-driven)
 */

import type { TemplatePriceTier } from "../tender-market.types";
import { computeTemplatePrice } from "../tender-market.types";
import { getTotalMarketplaceUsage } from "../analytics/template.performance";
import { resolveTemplateLicense } from "./template.license";

export function resolveTemplatePricing(tier: TemplatePriceTier): {
  tier: TemplatePriceTier;
  priceCny: number;
  license: ReturnType<typeof resolveTemplateLicense>;
  label: string;
} {
  const usageVolume = getTotalMarketplaceUsage();
  const priceCny = computeTemplatePrice(tier, usageVolume);
  const license = resolveTemplateLicense(tier);

  const labels: Record<TemplatePriceTier, string> = {
    FREE: "免费引流模板",
    INDUSTRY: `行业模板 ¥${priceCny}`,
    ENTERPRISE: `企业模板 ¥${priceCny}`,
  };

  return { tier, priceCny, license, label: labels[tier] };
}

export function recommendUpgradeTier(currentTier: TemplatePriceTier): TemplatePriceTier {
  if (currentTier === "FREE") return "INDUSTRY";
  if (currentTier === "INDUSTRY") return "ENTERPRISE";
  return "ENTERPRISE";
}
