/**
 * V64+ — Tender marketplace types
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import type { TenderTemplateId } from "@/lib/expansion/expansion.types";

export type TemplatePriceTier = "FREE" | "INDUSTRY" | "ENTERPRISE";

export type MarketplaceTemplate = {
  id: string;
  tenderTemplateId: TenderTemplateId;
  industry: VerticalIndustry;
  name: string;
  description: string;
  priceTier: TemplatePriceTier;
  priceCny: number;
  license: TemplateLicenseType;
  isFree: boolean;
  rating: number;
  usageCount: number;
};

export type TemplateLicenseType = "preview" | "single_download" | "enterprise_unlimited";

export type TemplateMetrics = {
  templateId: string;
  views: number;
  generations: number;
  previews: number;
  unlockAttempts: number;
  purchases: number;
  downloads: number;
  conversionRate: number;
  paidRate: number;
  downloadRate: number;
};

export type TemplateRecommendation = {
  templateId: string;
  name: string;
  reason: string;
  priceCny: number;
  priority: number;
};

export type TenderBusinessLoopResult = {
  traceId: string;
  templates: MarketplaceTemplate[];
  topPerformers: TemplateMetrics[];
  recommendations: TemplateRecommendation[];
  actions: string[];
  optimizations: string[];
  generatedAt: string;
};

export function computeTemplatePrice(tier: TemplatePriceTier, usageVolume: number): number {
  if (tier === "FREE") return 0;
  if (tier === "INDUSTRY") {
    const base = usageVolume > 50 ? 199 : 99;
    return base;
  }
  const base = usageVolume > 20 ? 999 : 499;
  return base;
}
