/**
 * V65 — Keyword strategy (data-driven from growth events)
 */

import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { derivePaidConversionRate } from "../growth-metrics.util";

const BASE_KEYWORDS = [
  "企业健身房方案",
  "AI健身空间规划",
  "健身房预算生成",
  "健身招采标书",
  "园区健身配套",
] as const;

export function buildKeywordStrategy(): {
  primary: string[];
  longTail: string[];
  intent: "commercial" | "informational" | "transactional";
} {
  const metrics = aggregateGrowthMetrics();
  const events = getGrowthEventsSnapshot();
  const utmSources = [
    ...new Set(events.map((e) => e.utmSource).filter(Boolean) as string[]),
  ];

  const primary: string[] = [...BASE_KEYWORDS];
  if (metrics.paidUsers > 0) primary.push("SaaS健身方案工具");
  if (metrics.signups > 10) primary.push("AI自动生成健身标书");

  const longTail = utmSources.length
    ? utmSources.map((s) => `${s} 企业健身解决方案`)
    : ["HR员工健身房建设方案", "写字楼健身空间预算模板"];

  const paidConv = derivePaidConversionRate(metrics);
  const intent: "commercial" | "informational" | "transactional" =
    paidConv > 10 ? "transactional" : "commercial";

  return { primary: [...primary], longTail, intent };
}

export function rankKeywordsByOpportunity(): { keyword: string; score: number }[] {
  const { primary, longTail } = buildKeywordStrategy();
  return [...primary, ...longTail].map((keyword, i) => ({
    keyword,
    score: Math.max(10, 100 - i * 8 + (keyword.includes("AI") ? 5 : 0)),
  }));
}
