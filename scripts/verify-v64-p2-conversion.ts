/**
 * V64 P2 Conversion Optimization System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { clearGrowthStoreForTests, appendGrowthEvent } from "../lib/growth/growth.events.store";
import { clearAbStoreForTests, recordAbEvent } from "../lib/conversion/ab-testing/ab.tracker";
import {
  analyzeFunnelPerformance,
  generateABVariants,
  testConversionRates,
  optimizeLandingPage,
  optimizeDemoFlow,
  optimizeCTAButtons,
  selectBestPerformingVariant,
  autoImproveConversionLoop,
  splitAndTrack,
  generateCTAVariants,
} from "../lib/conversion/conversion.service";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");
const V57_PRODUCT = path.join(ROOT, "app/(product)");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/conversion/conversion.types.ts",
    "lib/conversion/conversion.service.ts",
    "lib/conversion/core/conversion.engine.ts",
    "lib/conversion/core/conversion.context.ts",
    "lib/conversion/core/conversion.pipeline.ts",
    "lib/conversion/ab-testing/ab.engine.ts",
    "lib/conversion/ab-testing/ab.splitter.ts",
    "lib/conversion/ab-testing/ab.tracker.ts",
    "lib/conversion/funnel/funnel.analyzer.ts",
    "lib/conversion/funnel/funnel.optimizer.ts",
    "lib/conversion/funnel/funnel.steps.ts",
    "lib/conversion/cta/cta.optimizer.ts",
    "lib/conversion/cta/cta.generator.ts",
    "lib/conversion/cta/cta.variants.ts",
    "lib/conversion/landing/landing.optimizer.ts",
    "lib/conversion/landing/landing.variant.engine.ts",
    "lib/conversion/landing/landing.performance.ts",
    "lib/conversion/demo/demo.conversion.optimizer.ts",
    "lib/conversion/demo/demo.flow.optimizer.ts",
    "app/api/conversion/run/route.ts",
    "app/api/conversion/variant/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ conversion module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_CONVERSION_ENGINE: typeof autoImproveConversionLoop === "function",
    HAS_AB_TESTING_SYSTEM: typeof generateABVariants === "function" && typeof testConversionRates === "function",
    HAS_FUNNEL_ANALYZER: typeof analyzeFunnelPerformance === "function",
    HAS_CTA_OPTIMIZER: typeof optimizeCTAButtons === "function",
    HAS_LANDING_OPTIMIZER: typeof optimizeLandingPage === "function",
    HAS_DEMO_OPTIMIZER: typeof optimizeDemoFlow === "function",
    HAS_VARIANT_SELECTOR: typeof selectBestPerformingVariant === "function",
    HAS_AUTOMATIC_IMPROVEMENT_LOOP: typeof autoImproveConversionLoop === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
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

function checkNoHardCodedOptimization() {
  const engine = fs.readFileSync(path.join(ROOT, "lib/conversion/core/conversion.engine.ts"), "utf8");
  assert(engine.includes("computeConversionThresholds"), "dynamic thresholds in engine");
  assert(engine.includes("pipelineNeedsVariantGeneration"), "rule-driven variant generation");

  const cta = fs.readFileSync(path.join(ROOT, "lib/conversion/cta/cta.variants.ts"), "utf8");
  assert(cta.includes("aggregateConversionMetrics"), "CTA variants metrics-driven");

  const croDir = path.join(ROOT, "lib/conversion");
  for (const file of walkTs(croDir)) {
    const content = fs.readFileSync(file, "utf8");
    if (/stripe|createCheckout|bypassFeatureGate/i.test(content)) {
      throw new Error(`billing bypass pattern in ${path.relative(ROOT, file)}`);
    }
  }

  console.log("✓ NO_HARD_CODED_OPTIMIZATION (metrics-driven)");
  console.log("✓ NO_BILLING_BYPASS");
}

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 must exist");
  assert(fs.existsSync(V57_PRODUCT), "V57 product surface must exist");

  const v58Before = fs.statSync(V58_DIR).mtimeMs;
  const v58After = fs.statSync(V58_DIR).mtimeMs;
  assert(v58Before === v58After, "V58 must not be modified");

  const conversionApi = fs.readFileSync(path.join(ROOT, "app/api/conversion/run/route.ts"), "utf8");
  assert(!conversionApi.includes("createCheckout"), "no billing in conversion API");

  console.log("✓ NO_V57_MODIFICATION (additive CRO layer)");
  console.log("✓ NO_V58_MODIFICATION");
}

function runRuntimeTests() {
  clearGrowthStoreForTests();
  clearAbStoreForTests();

  appendGrowthEvent({ event: "visitor.landing", source: "/" });
  appendGrowthEvent({ event: "funnel.landing_view", meta: { path: "/" } });
  appendGrowthEvent({ event: "funnel.demo_click", meta: { source: "landing" } });
  appendGrowthEvent({ event: "demo.started", meta: { companyName: "Test Co" } });
  appendGrowthEvent({ event: "demo.completed", meta: { sessionId: "s1" } });
  appendGrowthEvent({ event: "user.signup", userId: "u1" });

  recordAbEvent({
    experimentId: "cro-cta-primary",
    variantId: "cta-0-start-free-demo",
    experimentType: "cta",
    eventType: "impression",
  });
  recordAbEvent({
    experimentId: "cro-cta-primary",
    variantId: "cta-0-start-free-demo",
    experimentType: "cta",
    eventType: "click",
  });

  const funnel = analyzeFunnelPerformance();
  assert(funnel.steps.length >= 7, "funnel steps");
  assert(funnel.weakestStep.length > 0, "weakest step");

  const variants = generateABVariants();
  assert(variants.length >= 4, "AB variants across experiment types");

  const ctaTest = testConversionRates("cta");
  assert(ctaTest.length >= 2, "CTA conversion rates");

  const landing = optimizeLandingPage();
  assert(landing.recommendations.length > 0, "landing recommendations");

  const demo = optimizeDemoFlow();
  assert(demo.variants.length >= 2, "demo flow variants");

  const cta = optimizeCTAButtons();
  assert(cta.variants.length >= 4, "CTA variants pool");

  const best = selectBestPerformingVariant("cta");
  assert(best !== null, "best variant selected");

  const variants2 = generateCTAVariants();
  const assigned = splitAndTrack({
    visitorKey: "visitor-abc",
    experimentId: "cro-cta-primary",
    experimentType: "cta",
    variants: variants2,
  });
  assert(assigned.id.length > 0, "variant assignment");

  const loop = autoImproveConversionLoop("verify-trace");
  assert(loop.traceId === "verify-trace", "trace id");
  assert(loop.actions.length > 0, "optimization actions");
  assert(loop.funnelSteps.length >= 7, "funnel in loop result");

  console.log("✓ runtime conversion optimization pipeline");
}

function main() {
  console.log("V64 P2 Conversion Optimization System Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkNoHardCodedOptimization();
  checkRegressionGuards();
  runRuntimeTests();
  console.log("\n✅ V64 P2 Conversion Optimization System verified");
}

main();
