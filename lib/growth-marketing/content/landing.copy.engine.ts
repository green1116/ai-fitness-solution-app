/**
 * V65 — Landing copy engine (optimizes V64 landing — no V64 file edits)
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { computeDynamicThresholds } from "../growth-marketing.types";
import { deriveSignupRate } from "../growth-metrics.util";

export type LandingCopyVariant = {
  heroHeadline: string;
  heroSubhead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  valueProps: string[];
};

export function generateLandingCopy(): LandingCopyVariant {
  const metrics = aggregateGrowthMetrics();
  const signupRate = deriveSignupRate(metrics);
  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate: signupRate,
  });

  const emphasizeSpeed = signupRate < thresholds.conversionRateLow;

  return {
    heroHeadline: emphasizeSpeed
      ? "3 分钟生成企业健身方案 — 免费 Demo 即时预览"
      : "AI 自动生成企业健身方案 + 标书 + 预算",
    heroSubhead: emphasizeSpeed
      ? "无需信用卡 · 输入企业信息即可生成 Quote / Budget / Tender 预览"
      : "面向企业、园区与招采场景，提升项目专业度与成交效率",
    ctaPrimary: "Free Demo",
    ctaSecondary: "Start Now",
    valueProps: [
      "3 分钟生成方案",
      "自动预算测算",
      "自动标书预览",
    ],
  };
}

export function optimizeLandingPages(): LandingCopyVariant & { recommendations: string[] } {
  const copy = generateLandingCopy();
  const metrics = aggregateGrowthMetrics();
  const recommendations: string[] = [];

  if (metrics.visitors > 0 && metrics.signups / metrics.visitors < 0.08) {
    recommendations.push("Move demo form above fold on /demo");
    recommendations.push("Add trust badges near CTA");
  }
  recommendations.push("A/B test hero headline variants via experiment engine");

  return { ...copy, recommendations };
}
