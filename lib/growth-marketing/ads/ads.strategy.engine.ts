/**
 * V65 — Ads strategy engine
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { deriveSignupRate } from "../growth-metrics.util";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import type { AdCopy } from "../growth-marketing.types";

export function buildAdsStrategy(): {
  channels: string[];
  budgetAllocation: Record<string, number>;
  focus: string;
} {
  const metrics = aggregateGrowthMetrics();
  const events = getGrowthEventsSnapshot();
  const utmPaid = events.filter((e) => e.utmMedium === "cpc" || e.utmMedium === "paid").length;
  const organic = events.filter((e) => e.event === "visitor.landing").length;

  const channels =
    utmPaid > organic * 0.3
      ? ["google_search", "linkedin", "retargeting"]
      : ["google_search", "linkedin", "content_syndication"];

  const total = 100;
  const budgetAllocation: Record<string, number> = {};
  const signupRate = deriveSignupRate(metrics);
  if (signupRate < 5) {
    budgetAllocation.google_search = 45;
    budgetAllocation.linkedin = 35;
    budgetAllocation.retargeting = 20;
  } else {
    budgetAllocation.google_search = 35;
    budgetAllocation.linkedin = 25;
    budgetAllocation.content_syndication = 40;
  }

  const sum = Object.values(budgetAllocation).reduce((a, b) => a + b, 0);
  if (sum !== total) budgetAllocation.retargeting = (budgetAllocation.retargeting ?? 0) + (total - sum);

  return {
    channels,
    budgetAllocation,
    focus: signupRate < 5 ? "conversion_optimization" : "scale_acquisition",
  };
}

export function generateAdCopyVariants(channel = "google_search"): AdCopy[] {
  const strategy = buildAdsStrategy();
  const headlines = [
    "AI 企业健身方案 · 3 分钟生成",
    "自动生成预算与招采标书",
    "园区 HR 健身配套一站式方案",
  ];

  return headlines.map((headline, i) => ({
    headline,
    description: "免费 Demo · 即时预览 Quote / Budget / Tender · 无需信用卡",
    cta: i === 0 ? "Try Free Demo" : "Start Now",
    channel,
    variant: `v${i + 1}`,
  }));
}

export function generateAdCopy(channel?: string): AdCopy {
  return generateAdCopyVariants(channel)[0];
}
