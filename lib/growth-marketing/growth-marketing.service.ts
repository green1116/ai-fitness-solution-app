/**
 * V65 — AI Growth Marketing public API
 */

export { generateSEOContentBundle, generateSEOContent } from "./seo/seo.engine";
export { optimizeLandingPages } from "./content/landing.copy.engine";
export { generateAdCopy, generateAdCopyVariants } from "./ads/ads.strategy.engine";
export { optimizeAdPerformance, optimizeAdsROI } from "./ads/ads.optimizer";
export { runABTesting } from "./experiment/ab.testing.engine";
export { analyzeTrafficSources, analyzeTrafficQuality } from "./traffic/traffic.analyzer";
export { optimizeConversionFunnels, runFunnelExperiment } from "./experiment/funnel.experiment";
export { generateViralContent } from "./content/viral.content.engine";
export { runGrowthLoop } from "./automation/growth.loop";
export { selfOptimizeGrowthLoop } from "./automation/self.optimization.engine";
export { runGrowthAutomation } from "./automation/growth.automation.engine";
export { generateBlogPost } from "./content/blog.engine";
export { generateMarketingContent } from "./content/content.generator";
export { increaseQualityTraffic } from "./traffic/acquisition.engine";

export type { GrowthLoopResult, SEOContent, AdCopy, ABTestVariant, TrafficSourceReport } from "./growth-marketing.types";

import { runGrowthLoop } from "./automation/growth.loop";

export function runGrowthMarketingCycle(traceId?: string) {
  return runGrowthLoop(traceId);
}
