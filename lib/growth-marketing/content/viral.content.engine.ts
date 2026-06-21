/**
 * V65 — Viral content engine
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";

export type ViralContentPiece = {
  platform: "linkedin" | "twitter" | "wechat";
  hook: string;
  body: string;
  hashtags: string[];
};

export function generateViralContent(): ViralContentPiece[] {
  const metrics = aggregateGrowthMetrics();
  const stat = metrics.firstQuoteGenerated > 0 ? `${metrics.firstQuoteGenerated}+ 企业已生成首份方案` : "企业健身方案 AI 化";

  return [
    {
      platform: "linkedin",
      hook: `🚀 ${stat}`,
      body: "我们用 AI 把企业健身房方案、预算、招采标书压缩到 3 分钟。免费 Demo 链接在评论区。",
      hashtags: ["#EnterpriseFitness", "#AI", "#HR"],
    },
    {
      platform: "twitter",
      hook: "Stop spending weeks on gym RFP docs.",
      body: "AI Fitness Solution: Quote + Budget + Tender preview in one demo. Try free.",
      hashtags: ["#SaaS", "#Fitness", "#B2B"],
    },
    {
      platform: "wechat",
      hook: "园区 HR 必看：健身配套方案 AI 自动生成",
      body: "输入企业信息，即刻获得方案预览与预算拆解。扫码免费体验 Demo。",
      hashtags: ["企业健身", "智慧园区", "AI方案"],
    },
  ];
}
