/**
 * V64 P2 — Landing variant engine
 */

import { aggregateConversionMetrics } from "../core/conversion.context";
import { computeConversionThresholds } from "../conversion.types";

export type LandingVariant = {
  id: string;
  headline: string;
  subhead: string;
  ctaPrimary: string;
  valuePropOrder: string[];
};

const VALUE_PROPS = [
  "3 分钟生成方案",
  "自动预算测算",
  "自动标书预览",
  "企业级 PDF 输出",
];

export function generateLandingVariants(): LandingVariant[] {
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const emphasizeSpeed = metrics.signupRate < thresholds.conversionRateLow;

  const speedHeadline = "3 分钟生成专业级企业健身方案 — 免费 Demo";
  const roiHeadline = "AI 自动生成企业健身方案 + 预算 + 标书";
  const trustHeadline = "企业级健身空间规划 — 无需咨询公司";

  const variants: LandingVariant[] = [
    {
      id: "landing-speed",
      headline: speedHeadline,
      subhead: "无需人工设计 · 无需咨询公司 · 即时预览 Quote / Budget / Tender",
      ctaPrimary: "Start Free Demo",
      valuePropOrder: emphasizeSpeed
        ? [VALUE_PROPS[0], VALUE_PROPS[1], VALUE_PROPS[2], VALUE_PROPS[3]]
        : [VALUE_PROPS[1], VALUE_PROPS[0], VALUE_PROPS[3], VALUE_PROPS[2]],
    },
    {
      id: "landing-roi",
      headline: roiHeadline,
      subhead: "面向企业、园区与招采场景，提升项目专业度与成交效率",
      ctaPrimary: "Generate Your Quote",
      valuePropOrder: [VALUE_PROPS[1], VALUE_PROPS[2], VALUE_PROPS[0], VALUE_PROPS[3]],
    },
    {
      id: "landing-trust",
      headline: trustHeadline,
      subhead: "透明预算 · 合规标书 · 直接可用 PDF",
      ctaPrimary: "Try AI Now",
      valuePropOrder: [VALUE_PROPS[3], VALUE_PROPS[2], VALUE_PROPS[1], VALUE_PROPS[0]],
    },
  ];

  return emphasizeSpeed ? variants : [variants[1], variants[0], variants[2]];
}
