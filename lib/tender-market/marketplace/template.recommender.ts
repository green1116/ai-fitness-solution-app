/**
 * V64+ — AI template recommendation engine
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import type { TemplateRecommendation } from "../tender-market.types";
import { listMarketplaceTemplates } from "./template.store";
import { rateTemplate } from "./template.rating";
import { recommendUpgradeTier } from "../pricing/template.pricing";

const UPSELL_CHAIN: Record<VerticalIndustry, VerticalIndustry[]> = {
  fitness: ["education", "enterprise"],
  education: ["enterprise", "procurement"],
  procurement: ["enterprise", "hr_admin"],
  enterprise: ["hr_admin"],
  hr_admin: ["enterprise"],
};

export function recommendTemplates(context?: {
  currentIndustry?: VerticalIndustry;
  currentTemplateId?: string;
  preferPaid?: boolean;
}): TemplateRecommendation[] {
  const all = listMarketplaceTemplates();
  const current = context?.currentTemplateId
    ? all.find((t) => t.id === context.currentTemplateId)
    : all.find((t) => t.industry === context?.currentIndustry);

  const recommendations: TemplateRecommendation[] = [];

  if (current) {
    const upgradeTier = recommendUpgradeTier(current.priceTier);
    const upsell = all.find(
      (t) => t.industry === current.industry && t.priceTier === upgradeTier,
    );
    if (upsell) {
      recommendations.push({
        templateId: upsell.id,
        name: upsell.name,
        reason: `Upgrade from ${current.priceTier} to ${upgradeTier}`,
        priceCny: upsell.priceCny,
        priority: 90,
      });
    }

    const nextIndustries = UPSELL_CHAIN[current.industry] ?? [];
    for (const ind of nextIndustries) {
      const cross = all
        .filter((t) => t.industry === ind && !t.isFree)
        .sort((a, b) => b.priceCny - a.priceCny)[0];
      if (cross) {
        recommendations.push({
          templateId: cross.id,
          name: cross.name,
          reason: `Cross-industry expansion: ${current.industry} → ${ind}`,
          priceCny: cross.priceCny,
          priority: 75,
        });
      }
    }
  }

  const topRated = all
    .filter((t) => !t.isFree || context?.preferPaid !== true)
    .map((t) => ({ t, r: rateTemplate(t.id) }))
    .sort((a, b) => b.r.score - a.r.score)
    .slice(0, 2);

  for (const { t, r } of topRated) {
    if (!recommendations.some((rec) => rec.templateId === t.id)) {
      recommendations.push({
        templateId: t.id,
        name: t.name,
        reason: `Top rated (${r.stars}★) — conversion optimized`,
        priceCny: t.priceCny,
        priority: 60 + r.score,
      });
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
