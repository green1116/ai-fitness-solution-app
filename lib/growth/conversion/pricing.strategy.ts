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
    label: "基础版",
    headline: "方案起步",
    monthlyPriceCny: 199,
    cta: "开始使用基础版",
    highlights: ["AI 方案生成", "基础企业健身规划", "50 次/月"],
  },
  PRO: {
    plan: "PRO",
    label: "专业版",
    headline: "方案 + 预算 + PDF",
    monthlyPriceCny: 499,
    cta: "升级到专业版",
    highlights: ["完整方案与预算", "企业级 PDF 导出", "500 次/月"],
  },
  ENTERPRISE: {
    plan: "ENTERPRISE",
    label: "企业版",
    headline: "投标 + API + 企业功能",
    monthlyPriceCny: 1999,
    cta: "开通企业版",
    highlights: ["完整投标文件", "API 接入", "无限用量与企业支持"],
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
