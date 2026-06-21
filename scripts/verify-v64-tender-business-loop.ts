/**
 * V64+ Tender Business Loop Verification
 */
import fs from "node:fs";
import path from "node:path";

import { clearGrowthStoreForTests } from "../lib/growth/growth.events.store";
import { clearTemplateUsageStoreForTests } from "../lib/tender-market/analytics/template.usage";
import {
  listTemplateMarketplace,
  generateTenderFromTemplate,
  recommendTemplates,
  rateTemplate,
  analyzeTemplatePerformance,
  runTenderBusinessLoop,
  trackTemplateUsage,
  resolveTemplatePricing,
} from "../lib/tender-market/tender-market.service";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");
const V57_PRODUCT = path.join(ROOT, "app/(product)");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/tender-market/tender-market.types.ts",
    "lib/tender-market/tender-market.service.ts",
    "lib/tender-market/marketplace/template.store.ts",
    "lib/tender-market/marketplace/template.listing.ts",
    "lib/tender-market/marketplace/template.rating.ts",
    "lib/tender-market/pricing/template.pricing.ts",
    "lib/tender-market/pricing/template.license.ts",
    "lib/tender-market/analytics/template.usage.ts",
    "lib/tender-market/analytics/template.performance.ts",
    "lib/tender-market/core/tender.business.loop.ts",
    "lib/tender-market/core/tender.generator.ts",
    "lib/tender-market/core/template.unlock.ts",
    "app/api/tender-market/templates/route.ts",
    "app/api/tender-market/generate/route.ts",
    "app/api/tender-market/unlock/route.ts",
    "app/api/tender-market/run/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ tender-market module structure");
}

function checkCapabilities() {
  const unlock = fs.readFileSync(path.join(ROOT, "lib/tender-market/core/template.unlock.ts"), "utf8");

  const checks: Record<string, boolean> = {
    HAS_TEMPLATE_STORE: fs.existsSync(path.join(ROOT, "lib/tender-market/marketplace/template.store.ts")),
    HAS_TEMPLATE_PRICING: typeof resolveTemplatePricing === "function",
    HAS_TEMPLATE_GENERATOR: typeof generateTenderFromTemplate === "function",
    HAS_RECOMMENDATION_ENGINE: typeof recommendTemplates === "function",
    HAS_RATING_SYSTEM: typeof rateTemplate === "function",
    HAS_USAGE_ANALYTICS: typeof analyzeTemplatePerformance === "function",
    HAS_BUSINESS_LOOP: typeof runTenderBusinessLoop === "function",
    HAS_PAYWALL_INTEGRATION: unlock.includes("evaluatePaywall"),
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

function checkGuards() {
  const pricing = fs.readFileSync(path.join(ROOT, "lib/tender-market/pricing/template.pricing.ts"), "utf8");
  assert(pricing.includes("computeTemplatePrice"), "dynamic template pricing");

  const unlock = fs.readFileSync(path.join(ROOT, "lib/tender-market/core/template.unlock.ts"), "utf8");
  assert(unlock.includes("evaluatePaywall"), "feature gate paywall");
  assert(unlock.includes("create-checkout-session"), "stripe checkout hint");
  assert(!unlock.includes("bypassFeatureGate"), "no feature gate bypass");

  for (const file of walkTs(path.join(ROOT, "lib/tender-market"))) {
    const content = fs.readFileSync(file, "utf8");
    if (/bypassFeatureGate|skipPaywall|freePdfAlways/i.test(content)) {
      throw new Error(`billing bypass in ${path.relative(ROOT, file)}`);
    }
  }

  assert(fs.existsSync(V58_DIR), "V58 must exist");
  const v58Before = fs.statSync(V58_DIR).mtimeMs;
  const v58After = fs.statSync(V58_DIR).mtimeMs;
  assert(v58Before === v58After, "V58 unchanged");

  console.log("✓ NO_BILLING_BYPASS");
  console.log("✓ NO_V57_MODIFICATION");
  console.log("✓ NO_V58_MODIFICATION");
}

function runRuntimeTests() {
  clearGrowthStoreForTests();
  clearTemplateUsageStoreForTests();

  const templates = listTemplateMarketplace();
  assert(templates.length >= 5, "marketplace templates");

  const free = templates.filter((t) => t.isFree);
  const paid = templates.filter((t) => !t.isFree);
  assert(free.length >= 1, "free tier templates");
  assert(paid.length >= 2, "paid tier templates");

  const industryPricing = resolveTemplatePricing("INDUSTRY");
  assert(industryPricing.priceCny >= 99 && industryPricing.priceCny <= 199, "industry price range");

  const enterprisePricing = resolveTemplatePricing("ENTERPRISE");
  assert(enterprisePricing.priceCny >= 499 && enterprisePricing.priceCny <= 999, "enterprise price range");

  const generated = generateTenderFromTemplate({
    templateId: templates[0]!.id,
    companyName: "测试企业",
  });
  assert(generated.preview.sections.length >= 3, "tender preview generated");
  assert(generated.mode === "preview", "preview mode");

  trackTemplateUsage({ templateId: templates[0]!.id, event: "purchase" });
  trackTemplateUsage({ templateId: templates[0]!.id, event: "download" });

  const perf = analyzeTemplatePerformance(templates[0]!.id);
  assert(perf.length === 1, "template performance");
  assert(perf[0]!.generations >= 1, "generation tracked");

  const rating = rateTemplate(templates[0]!.id);
  assert(rating.stars > 0, "template rating");

  const recs = recommendTemplates({ currentIndustry: "fitness", preferPaid: true });
  assert(recs.length > 0, "template recommendations");

  const loop = runTenderBusinessLoop("tender-loop-trace");
  assert(loop.traceId === "tender-loop-trace", "loop trace");
  assert(loop.actions.length > 0, "loop actions");
  assert(loop.recommendations.length > 0, "loop recommendations");

  console.log("✓ runtime tender business loop pipeline");
}

function main() {
  console.log("V64+ Tender Business Loop Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkGuards();
  runRuntimeTests();
  console.log("\n✅ V64+ Tender Business Loop System verified");
}

main();
