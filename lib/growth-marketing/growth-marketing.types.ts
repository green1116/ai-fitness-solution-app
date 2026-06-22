/**
 * V65 — AI Growth Marketing types
 */

export type GrowthMarketingChannel = "seo" | "ads" | "content" | "organic" | "referral" | "social";

export type TrafficQuality = "high" | "medium" | "low";

export type GrowthThresholds = {
  conversionRateLow: number;
  signupRateLow: number;
  trafficQualityMin: number;
  abTestMinSample: number;
};

export type SEOContent = {
  title: string;
  keywords: string[];
  metaDescription: string;
  body: string;
  slug: string;
};

export type AdCopy = {
  headline: string;
  description: string;
  cta: string;
  channel: string;
  variant: string;
};

export type ABTestVariant = {
  id: string;
  name: string;
  conversionRate: number;
  impressions: number;
  winner: boolean;
};

export type TrafficSourceReport = {
  source: string;
  visits: number;
  signups: number;
  conversionRate: number;
  quality: TrafficQuality;
};

export type GrowthLoopResult = {
  traceId: string;
  thresholds: GrowthThresholds;
  actions: string[];
  optimizations: string[];
  experiments: ABTestVariant[];
  generatedAt: string;
};

export function computeDynamicThresholds(metrics: {
  visitors: number;
  signups: number;
  conversionRate: number;
}): GrowthThresholds {
  const baseConversion = metrics.visitors > 100 ? 8 : 5;
  const baseSignup = metrics.visitors > 50 ? 12 : 8;
  return {
    conversionRateLow: Math.max(3, baseConversion - 2),
    signupRateLow: Math.max(5, baseSignup - 3),
    trafficQualityMin: metrics.visitors > 200 ? 0.35 : 0.25,
    abTestMinSample: Math.min(500, Math.max(50, metrics.visitors)),
  };
}
