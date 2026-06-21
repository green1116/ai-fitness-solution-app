/**
 * V64 P2 — Conversion optimization types
 */

export type ConversionExperimentType = "landing" | "cta" | "demo" | "pricing";

export type ConversionMetrics = {
  landingView: number;
  demoStart: number;
  demoComplete: number;
  signupRate: number;
  conversionRate: number;
};

export type ConversionThresholds = {
  conversionRateLow: number;
  ctaClickRateLow: number;
  demoDropOffHigh: number;
  abTestMinSample: number;
};

export type ConversionVariant = {
  id: string;
  experimentType: ConversionExperimentType;
  name: string;
  payload: Record<string, string>;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  winner: boolean;
};

export type FunnelStepMetrics = {
  step: string;
  count: number;
  dropOffRate: number;
  conversionFromPrevious: number;
};

export type ConversionLoopResult = {
  traceId: string;
  metrics: ConversionMetrics;
  thresholds: ConversionThresholds;
  bestVariants: ConversionVariant[];
  optimizations: string[];
  actions: string[];
  funnelSteps: FunnelStepMetrics[];
  generatedAt: string;
};

export function computeConversionThresholds(metrics: ConversionMetrics): ConversionThresholds {
  const baseConversion = metrics.landingView > 100 ? 8 : 5;
  const baseCta = metrics.landingView > 50 ? 15 : 10;
  const baseDropOff = metrics.demoStart > 20 ? 45 : 55;
  return {
    conversionRateLow: Math.max(3, baseConversion - 2),
    ctaClickRateLow: Math.max(8, baseCta - 4),
    demoDropOffHigh: Math.min(70, baseDropOff),
    abTestMinSample: Math.min(500, Math.max(30, metrics.landingView)),
  };
}
