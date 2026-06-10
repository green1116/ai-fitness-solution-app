import type { Campaign } from "./types";

const SAMPLES: Array<Omit<Campaign, "campaignId" | "mode">> = [
  { name: "健身中心招标季推广", source: "content-marketing", status: "active", segment: "government", impressions: 12000, conversions: 48, conversionRate: 0.04, trend: "up" },
  { name: "行业展会 Q1", source: "trade-show", status: "completed", segment: "enterprise", impressions: 3500, conversions: 22, conversionRate: 0.063, trend: "stable" },
  { name: "合作伙伴联合营销", source: "partner-referral", status: "active", segment: "campus", impressions: 8000, conversions: 35, conversionRate: 0.044, trend: "up" },
  { name: "搜索引擎投放", source: "paid-search", status: "paused", segment: "industrial", impressions: 15000, conversions: 30, conversionRate: 0.02, trend: "down" },
];

export function buildCampaigns(input?: { deploymentId?: string }): Campaign[] {
  const deploymentId = input?.deploymentId ?? "campaign-default";
  return SAMPLES.map((s, i) => ({
    campaignId: `campaign-${deploymentId}-${i + 1}`,
    ...s,
    mode: "readiness-stub" as const,
  }));
}

export function summarizeCampaignPerformance(campaigns: Campaign[]): {
  campaignPerformance: number;
  campaignConversion: number;
} {
  const active = campaigns.filter((c) => c.status === "active" || c.status === "completed");
  const totalImpressions = active.reduce((s, c) => s + c.impressions, 0);
  const totalConversions = active.reduce((s, c) => s + c.conversions, 0);
  return {
    campaignPerformance: Math.round((totalConversions / Math.max(totalImpressions, 1)) * 1000) / 10,
    campaignConversion: Math.round((totalConversions / Math.max(active.length, 1)) * 10) / 10,
  };
}
