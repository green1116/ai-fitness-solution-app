/**
 * V64+ — Template marketplace store
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import { getTenderTemplate } from "@/lib/expansion/templates/tender.templates";
import type { MarketplaceTemplate } from "../tender-market.types";
import { resolveTemplatePricing } from "../pricing/template.pricing";
import { aggregateUsageByTemplate } from "../analytics/template.usage";

const CATALOG: {
  id: string;
  industry: VerticalIndustry;
  tenderTemplateId: "tender_standard_cn" | "tender_enterprise_pro";
  tier: "FREE" | "INDUSTRY" | "ENTERPRISE";
  description: string;
}[] = [
  {
    id: "tmpl-fitness-free",
    industry: "fitness",
    tenderTemplateId: "tender_standard_cn",
    tier: "FREE",
    description: "健身空间标准招采标书 — 免费预览引流",
  },
  {
    id: "tmpl-fitness-industry",
    industry: "fitness",
    tenderTemplateId: "tender_standard_cn",
    tier: "INDUSTRY",
    description: "健身连锁 / 企业健身房完整标书包",
  },
  {
    id: "tmpl-education-industry",
    industry: "education",
    tenderTemplateId: "tender_standard_cn",
    tier: "INDUSTRY",
    description: "校园体育设施招采标书模板",
  },
  {
    id: "tmpl-procurement-industry",
    industry: "procurement",
    tenderTemplateId: "tender_standard_cn",
    tier: "INDUSTRY",
    description: "政府采购健身配套标书模板",
  },
  {
    id: "tmpl-enterprise-pro",
    industry: "enterprise",
    tenderTemplateId: "tender_enterprise_pro",
    tier: "ENTERPRISE",
    description: "企业级完整标书 + SLA + 设备目录",
  },
  {
    id: "tmpl-hr-enterprise",
    industry: "hr_admin",
    tenderTemplateId: "tender_enterprise_pro",
    tier: "ENTERPRISE",
    description: "HR 员工福利健身房企业标书套装",
  },
];

export function listMarketplaceTemplates(): MarketplaceTemplate[] {
  return CATALOG.map((item) => {
    const tender = getTenderTemplate(item.tenderTemplateId);
    const pricing = resolveTemplatePricing(item.tier);
    const usage = aggregateUsageByTemplate(item.id);
    const usageCount = usage.generate;
    const conversionBonus = usage.view > 0 ? Math.round((usage.generate / usage.view) * 100) : 0;

    return {
      id: item.id,
      tenderTemplateId: item.tenderTemplateId,
      industry: item.industry,
      name: `${tender.name} · ${item.industry}`,
      description: item.description,
      priceTier: item.tier,
      priceCny: pricing.priceCny,
      license: pricing.license.type,
      isFree: item.tier === "FREE",
      rating: Math.min(5, 3.5 + conversionBonus / 50 + Math.min(usageCount / 20, 1)),
      usageCount,
    };
  });
}

export function getMarketplaceTemplate(id: string): MarketplaceTemplate | undefined {
  return listMarketplaceTemplates().find((t) => t.id === id);
}
