import type { GO_TO_MARKET_VERSION, ReadinessStubMode } from "../shared/types";

export const CAMPAIGN_RUNTIME_VERSION = "v17.0-campaign-runtime-1" as const;

export const CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_SOURCES = ["content-marketing", "trade-show", "partner-referral", "paid-search"] as const;
export type CampaignSource = (typeof CAMPAIGN_SOURCES)[number];

export interface Campaign {
  campaignId: string;
  name: string;
  source: CampaignSource;
  status: CampaignStatus;
  segment: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  trend: "up" | "stable" | "down";
  mode: ReadinessStubMode;
}

export interface CampaignRuntimePayload {
  version: typeof CAMPAIGN_RUNTIME_VERSION;
  gtmVersion: typeof GO_TO_MARKET_VERSION;
  campaigns: Campaign[];
  campaignPerformance: number;
  campaignConversion: number;
  summary: string;
}
