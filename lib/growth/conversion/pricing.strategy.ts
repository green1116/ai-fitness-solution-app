/**
 * V60 P1 — Pricing strategy for conversion prompts
 */

import type { SaasPlan } from "@/lib/saas/types";

export type PricingTier = {
  plan: SaasPlan;
  label: string;
  headline: string;
  monthlyPriceCny: number;
  cta: string;
  highlights: string[];
};

export const PRICING_TIERS: Record<SaasPlan, PricingTier> = {
  BASIC: {
    plan: "BASIC",
    label: "Basic",
    headline: "Quote + 基础方案",
    monthlyPriceCny: 199,
    cta: "Start with Basic",
    highlights: ["AI Quote 方案生成", "基础企业健身规划", "50 次/月"],
  },
  PRO: {
    plan: "PRO",
    label: "Pro",
    headline: "Quote + Budget + PDF",
    monthlyPriceCny: 499,
    cta: "Upgrade to Pro",
    highlights: ["完整 Quote + Budget", "企业级 PDF 导出", "500 次/月"],
  },
  ENTERPRISE: {
    plan: "ENTERPRISE",
    label: "Enterprise",
    headline: "Tender + API + 企业功能",
    monthlyPriceCny: 1999,
    cta: "Contact Enterprise",
    highlights: ["完整 Tender 标书", "API 接入", "无限用量 + 企业支持"],
  },
};

export function recommendPlanForFeature(feature: string): SaasPlan {
  if (feature.includes("Tender") || feature.includes("API") || feature === "canUseAPI") {
    return "ENTERPRISE";
  }
  if (feature.includes("Budget") || feature.includes("PDF") || feature.includes("Export")) {
    return "PRO";
  }
  return "PRO";
}

export function getPricingTier(plan: SaasPlan): PricingTier {
  return PRICING_TIERS[plan];
}

export function buildUpgradeMessage(fromPlan: SaasPlan, toPlan: SaasPlan): string {
  const tier = PRICING_TIERS[toPlan];
  return `Upgrade from ${fromPlan} to ${toPlan}: ${tier.headline}`;
}
