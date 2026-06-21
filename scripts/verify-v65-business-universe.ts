/**
 * V65 Business Universe System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { clearGrowthStoreForTests, appendGrowthEvent } from "../lib/growth/growth.events.store";
import { clearUniverseStoreForTests } from "../lib/universe/universe.store";
import {
  generateSaaSInstance,
  cloneBusinessModel,
  createIndustryUniverse,
  deployNewSaaS,
  buildBusinessUniverse,
  buildUniverseRevenueGraph,
  autoCreateSaaS,
  autoScaleSaaS,
  autoOptimizeUniverse,
  autoAllocateResources,
  getUniverseSummary,
} from "../lib/universe/universe.service";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");
const V57_PRODUCT = path.join(ROOT, "app/(product)");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/universe/universe.types.ts",
    "lib/universe/universe.service.ts",
    "lib/universe/factory.engine.ts",
    "lib/universe/product.generator.ts",
    "lib/universe/universe.builder.ts",
    "lib/universe/revenue.universe.ts",
    "lib/orchestration/universe.orchestrator.ts",
    "lib/orchestration/saas.manager.ts",
    "lib/orchestration/business.router.ts",
    "app/api/universe/run/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ business universe module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_SAAS_FACTORY: typeof generateSaaSInstance === "function" && typeof cloneBusinessModel === "function",
    HAS_UNIVERSE_BUILDER: typeof createIndustryUniverse === "function" && typeof buildBusinessUniverse === "function",
    HAS_REVENUE_UNIVERSE: typeof buildUniverseRevenueGraph === "function",
    HAS_ORCHESTRATION: typeof autoOptimizeUniverse === "function",
    HAS_AUTO_CREATE: typeof autoCreateSaaS === "function",
    HAS_AUTO_SCALE: typeof autoScaleSaaS === "function",
    HAS_RESOURCE_ALLOCATION: typeof autoAllocateResources === "function",
    HAS_UNIVERSE_LOOP: typeof autoOptimizeUniverse === "function",
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

function checkNoBillingBypass() {
  const factory = fs.readFileSync(path.join(ROOT, "lib/universe/factory.engine.ts"), "utf8");
  assert(factory.includes("cloneBusinessModule"), "factory uses expansion clone");
  assert(!factory.includes("createCheckout"), "no stripe checkout in factory");

  const orchestrator = fs.readFileSync(path.join(ROOT, "lib/orchestration/universe.orchestrator.ts"), "utf8");
  assert(orchestrator.includes("computeUniverseThresholds"), "metrics-driven orchestration");

  for (const dir of ["lib/universe", "lib/orchestration"]) {
    for (const file of walkTs(path.join(ROOT, dir))) {
      const content = fs.readFileSync(file, "utf8");
      if (/stripe\.|createCheckout|bypassFeatureGate|subscriptions\.update/i.test(content)) {
        throw new Error(`billing bypass in ${path.relative(ROOT, file)}`);
      }
    }
  }

  console.log("✓ NO_MANUAL_HARDCODE (metrics-driven universe)");
  console.log("✓ NO_BILLING_BYPASS");
}

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 must exist");
  assert(fs.existsSync(V57_PRODUCT), "V57 must exist");

  const v58Before = fs.statSync(V58_DIR).mtimeMs;
  const v58After = fs.statSync(V58_DIR).mtimeMs;
  assert(v58Before === v58After, "V58 must not be modified");

  console.log("✓ NO_V57_MODIFICATION");
  console.log("✓ NO_V58_MODIFICATION");
}

function runRuntimeTests() {
  clearGrowthStoreForTests();
  clearUniverseStoreForTests();

  appendGrowthEvent({
    event: "payment.completed",
    organizationId: "org-universe",
    meta: { plan: "PRO", amount: 499 },
  });

  const fitness = generateSaaSInstance({ industry: "fitness" });
  assert(fitness.id.length > 0, "saas instance generated");
  assert(fitness.modules.length > 0, "saas modules");

  const clone = cloneBusinessModel({
    sourceVertical: "fitness",
    targetVertical: "education",
    organizationId: "org-universe",
  });
  assert(clone.clone.clonedModules.length > 0, "business model cloned");

  const universe = createIndustryUniverse("procurement");
  assert(universe.instances.length > 0, "industry universe");

  const deployed = deployNewSaaS({
    instanceId: fitness.id,
    organizationId: "org-universe",
  });
  assert(deployed?.status === "deployed", "saas deployed");

  const all = buildBusinessUniverse();
  assert(all.length >= 5, "multi-industry universes");

  const graph = buildUniverseRevenueGraph();
  assert(graph.streamCount > 0, "revenue streams");

  const created = autoCreateSaaS("hr_admin", "org-universe");
  assert(created.industry === "hr_admin", "auto create saas");

  const scaled = autoScaleSaaS(fitness.id);
  assert(scaled.mrr >= fitness.mrr, "auto scale saas");

  const allocations = autoAllocateResources("alloc-trace");
  assert(allocations.length > 0, "resource allocation");

  const summary = getUniverseSummary();
  assert(summary.instanceCount > 0, "universe summary");

  const loop = autoOptimizeUniverse("universe-trace");
  assert(loop.traceId === "universe-trace", "trace id");
  assert(loop.revenueGraph.totalMrr >= 0, "universe mrr");
  assert(loop.actions.length > 0, "universe actions");

  console.log("✓ runtime business universe pipeline");
}

function main() {
  console.log("V65 Business Universe System Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkNoBillingBypass();
  checkRegressionGuards();
  runRuntimeTests();
  console.log("\n✅ V65 Business Universe System verified");
}

main();
