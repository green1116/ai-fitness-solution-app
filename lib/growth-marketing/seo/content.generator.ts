/**
 * V65 — SEO content generator
 */

import type { SEOContent } from "../growth-marketing.types";
import { buildKeywordStrategy, rankKeywordsByOpportunity } from "./keyword.strategy";

export function generateSEOContent(topic?: string): SEOContent {
  const strategy = buildKeywordStrategy();
  const top = rankKeywordsByOpportunity()[0];
  const keyword = topic ?? top?.keyword ?? strategy.primary[0];
  const slug = keyword.replace(/\s+/g, "-").toLowerCase().slice(0, 60);

  return {
    title: `${keyword} | AI Fitness Solution`,
    keywords: strategy.primary.slice(0, 5),
    metaDescription: `使用 AI 自动生成${keyword}，3分钟完成方案、预算与标书预览。`,
    body: [
      `## ${keyword}`,
      "",
      "AI Fitness Solution 帮助企业 HR、园区运营与招采团队快速完成健身空间规划。",
      "",
      "### 核心能力",
      "- 3 分钟生成企业健身方案",
      "- 自动预算测算与设备选型",
      "- 招采标书结构自动生成",
      "",
      `搜索意图：${strategy.intent}`,
    ].join("\n"),
    slug,
  };
}
