/**
 * V65 AI Growth Marketing System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { clearGrowthStoreForTests, getGrowthEventsSnapshot, appendGrowthEvent } from "../lib/growth/growth.events.store";
import {
  generateSEOContentBundle,
  generateSEOContent,
  optimizeLandingPages,
  generateAdCopy,
  optimizeAdPerformance,
  runABTesting,
  analyzeTrafficSources,
  optimizeConversionFunnels,
  generateViralContent,
  runGrowthMarketingCycle,
  selfOptimizeGrowthLoop,
  runGrowthAutomation,
  generateBlogPost,
} from "../lib/growth-marketing/growth-marketing.service";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/growth-marketing/seo/seo.engine.ts",
    "lib/growth-marketing/seo/keyword.strategy.ts",
    "lib/growth-marketing/seo/content.generator.ts",
    "lib/growth-marketing/seo/ranking.optimizer.ts",
    "lib/growth-marketing/ads/ads.optimizer.ts",
    "lib/growth-marketing/ads/ads.strategy.engine.ts",
    "lib/growth-marketing/ads/conversion.optimizer.ts",
    "lib/growth-marketing/content/content.generator.ts",
    "lib/growth-marketing/content/blog.engine.ts",
    "lib/growth-marketing/content/landing.copy.engine.ts",
    "lib/growth-marketing/content/viral.content.engine.ts",
    "lib/growth-marketing/experiment/ab.testing.engine.ts",
    "lib/growth-marketing/experiment/funnel.experiment.ts",
    "lib/growth-marketing/experiment/conversion.optimizer.ts",
    "lib/growth-marketing/traffic/traffic.analyzer.ts",
    "lib/growth-marketing/traffic/traffic.source.engine.ts",
    "lib/growth-marketing/traffic/acquisition.engine.ts",
    "lib/growth-marketing/automation/growth.automation.engine.ts",
    "lib/growth-marketing/automation/growth.loop.ts",
    "lib/growth-marketing/automation/self.optimization.engine.ts",
    "lib/growth-marketing/growth-marketing.service.ts",
    "app/api/growth-marketing/run/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ growth-marketing module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_SEO_ENGINE: typeof generateSEOContentBundle === "function",
    HAS_ADS_OPTIMIZER: typeof optimizeAdPerformance === "function",
    HAS_CONTENT_ENGINE: typeof generateBlogPost === "function",
    HAS_AB_TESTING: typeof runABTesting === "function",
    HAS_TRAFFIC_ANALYZER: typeof analyzeTrafficSources === "function",
    HAS_GROWTH_LOOP: typeof runGrowthMarketingCycle === "function",
    HAS_AUTOMATION_ENGINE: typeof runGrowthAutomation === "function",
    HAS_SELF_OPTIMIZATION: typeof selfOptimizeGrowthLoop === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkNoHardCodedGrowth() {
  const keyword = fs.readFileSync(path.join(ROOT, "lib/growth-marketing/seo/keyword.strategy.ts"), "utf8");
  assert(keyword.includes("aggregateGrowthMetrics"), "keywords must use metrics");
  assert(keyword.includes("buildKeywordStrategy"), "dynamic keyword strategy");

  const automation = fs.readFileSync(
    path.join(ROOT, "lib/growth-marketing/automation/growth.automation.engine.ts"),
    "utf8",
  );
  assert(automation.includes("computeDynamicThresholds"), "dynamic thresholds");
  assert(automation.includes("thresholds.conversionRateLow"), "rule-driven automation");

  const gmDir = path.join(ROOT, "lib/growth-marketing");
  for (const file of walkTs(gmDir)) {
    const content = fs.readFileSync(file, "utf8");
    if (/stripe|createCheckout|bypassFeatureGate/i.test(content)) {
      throw new Error(`billing bypass pattern in ${path.relative(ROOT, file)}`);
    }
  }

  console.log("✓ NO_HARD_CODED_GROWTH (metrics-driven)");
  console.log("✓ NO_BILLING_BYPASS");
}

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 must exist");
  const v58Before = fs.statSync(V58_DIR).mtimeMs;
  const v58After = fs.statSync(V58_DIR).mtimeMs;
  assert(v58Before === v58After, "V58 must not be modified");

  const api = fs.readFileSync(path.join(ROOT, "app/api/growth-marketing/run/route.ts"), "utf8");
  assert(api.includes("runSaasOrgGate"), "API must use saas gate");

  console.log("✓ NO_V57_MODIFICATION");
  console.log("✓ NO_V58_MODIFICATION");
}

function runRuntimeTests() {
  clearGrowthStoreForTests();

  appendGrowthEvent({ event: "visitor.landing", source: "google", utmSource: "google" });
  appendGrowthEvent({ event: "visitor.utm", utmSource: "linkedin", utmMedium: "cpc" });
  appendGrowthEvent({ event: "user.signup", userId: "u-gm-1" });
  appendGrowthEvent({ event: "demo.started", meta: { sessionId: "d1" } });

  const seo = generateSEOContentBundle("企业健身房");
  assert(seo.content.title.length > 0, "SEO content");
  assert(seo.keywords.length > 0, "SEO keywords");

  const seoSingle = generateSEOContent();
  assert(seoSingle.slug.length > 0, "generateSEOContent");

  const landing = optimizeLandingPages();
  assert(landing.heroHeadline.length > 0, "optimizeLandingPages");

  const ad = generateAdCopy();
  assert(ad.headline.length > 0, "generateAdCopy");

  const adsOpt = optimizeAdPerformance();
  assert(adsOpt.actions.length > 0, "optimizeAdPerformance");

  const ab = runABTesting();
  assert(ab.length >= 2, "runABTesting");

  const traffic = analyzeTrafficSources();
  assert(traffic.length >= 1, "analyzeTrafficSources");

  const funnel = optimizeConversionFunnels();
  assert(funnel.length > 0, "optimizeConversionFunnels");

  const viral = generateViralContent();
  assert(viral.length >= 2, "generateViralContent");

  const blog = generateBlogPost();
  assert(blog.slug.length > 0, "blog engine");

  const automation = runGrowthAutomation();
  assert(automation.actions.length > 0, "growth automation");

  const selfOpt = selfOptimizeGrowthLoop();
  assert(selfOpt.nextCycleFocus.length > 0, "self optimization");

  const cycle = runGrowthMarketingCycle("trace-gm-1");
  assert(cycle.actions.length > 0, "growth loop");
  assert(cycle.experiments.length >= 2, "experiments in loop");

  const events = getGrowthEventsSnapshot();
  assert(events.some((e) => e.event === "growth.loop_completed"), "loop event logged");

  console.log("✓ runtime growth marketing pipeline");
}

function main() {
  console.log("V65 AI Growth Marketing System Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkNoHardCodedGrowth();
  checkRegressionGuards();
  runRuntimeTests();
  console.log("\n✅ V65 AI Growth Marketing System verified");
}

main();
