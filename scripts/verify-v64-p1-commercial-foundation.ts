/**
 * V64 P1 — Commercial Productization Foundation Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_COMMERCIAL_FOUNDATION_VERSION,
  buildCommercialFoundation,
  buildCapabilityMap,
  buildCommercialFeatureMatrix,
  buildCommercialMetadata,
  buildCommercialPricingConfig,
  buildCommercialProductConfig,
  buildPlanRegistry,
  validateCommercialFoundation,
  PRODUCT_TO_SAAS_PLAN,
  SAAS_TO_PRODUCT_TIER,
  PRODUCT_FEATURE_TO_CAPABILITY,
} from "../lib/commercial/v64";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p1-commercial-foundation-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/index.ts",
    "lib/commercial/v64/types.ts",
    "lib/commercial/v64/foundation.ts",
    "lib/commercial/v64/product.config.ts",
    "lib/commercial/v64/pricing.config.ts",
    "lib/commercial/v64/feature.matrix.ts",
    "lib/commercial/v64/plan.registry.ts",
    "lib/commercial/v64/capability.map.ts",
    "lib/commercial/v64/commercial.metadata.ts",
    "docs/production/V64-COMMERCIAL-FOUNDATION.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 commercial foundation module structure");
}

function testProductAndPricingConfig() {
  const product = buildCommercialProductConfig({ deploymentId: DEPLOYMENT_ID });
  assert(product.version === V64_COMMERCIAL_FOUNDATION_VERSION, "product config version");
  assert(product.catalog.products.length === 3, "product catalog tiers");
  assert(product.tiers.length === 3, "product tiers");

  const pricing = buildCommercialPricingConfig({ deploymentId: DEPLOYMENT_ID });
  assert(pricing.entries.length === 3, "pricing entries");
  assert(
    pricing.entries.every((e) => e.monthlyPriceCny != null && e.monthlyPriceCny > 0),
    "display pricing reference",
  );
  assert(pricing.entries.every((e) => e.catalogDisplayPrice === "Custom pricing"), "catalog pricing preserved");

  console.log("✓ product & pricing config");
  console.log(" ", product.summary);
  console.log(" ", pricing.summary);
}

function testFeatureMatrixAndPlanRegistry() {
  const matrix = buildCommercialFeatureMatrix({ deploymentId: DEPLOYMENT_ID });
  assert(matrix.foundationVersion === V64_COMMERCIAL_FOUNDATION_VERSION, "feature matrix foundation version");
  assert(matrix.features.length >= 7, "feature matrix rows");
  assert(matrix.tiers.length === 3, "feature matrix tiers");

  const registry = buildPlanRegistry({ deploymentId: DEPLOYMENT_ID });
  assert(registry.plans.length === 3, "plan registry count");
  for (const plan of registry.plans) {
    assert(plan.planId.startsWith("plan-"), `plan id ${plan.planId}`);
    assert(plan.subscriptionPlanId.startsWith("subscription-plan-"), `subscription id ${plan.subscriptionPlanId}`);
    assert(PRODUCT_TO_SAAS_PLAN[plan.productTier] === plan.saasPlan, `saas map ${plan.productTier}`);
  }

  console.log("✓ feature matrix & plan registry");
  console.log(" ", matrix.summary);
  console.log(" ", registry.summary);
}

function testCapabilityMapping() {
  const map = buildCapabilityMap({ deploymentId: DEPLOYMENT_ID });
  assert(map.tiers.length === 3, "capability tiers");
  assert(PRODUCT_FEATURE_TO_CAPABILITY.length >= 7, "capability bindings");

  assert(SAAS_TO_PRODUCT_TIER.BASIC === "starter", "BASIC -> starter");
  assert(SAAS_TO_PRODUCT_TIER.PRO === "professional", "PRO -> professional");
  assert(SAAS_TO_PRODUCT_TIER.ENTERPRISE === "enterprise", "ENTERPRISE -> enterprise");

  const enterprise = map.tiers.find((t) => t.productTier === "enterprise");
  assert(Boolean(enterprise?.featureFlags.includes("canUseAPI")), "enterprise API flag");
  assert(Boolean(enterprise?.featureFlags.includes("canGenerateTender")), "enterprise tender flag");

  const starter = map.tiers.find((t) => t.productTier === "starter");
  assert(Boolean(starter?.featureFlags.includes("canGenerateQuote")), "starter quote flag");
  assert(!starter?.featureFlags.includes("canGenerateTender"), "starter no tender");

  console.log("✓ capability mapping");
  console.log(" ", map.summary);
}

function testFoundationAndMetadata() {
  const foundation = buildCommercialFoundation({ deploymentId: DEPLOYMENT_ID });
  assert(foundation.version === V64_COMMERCIAL_FOUNDATION_VERSION, "foundation version");
  assert(foundation.commercialMetadata.foundationReady, "foundation ready");
  assert(foundation.commercialMetadata.backwardCompatible.packagingValid, "packaging backward compatible");

  const metadata = buildCommercialMetadata({ deploymentId: DEPLOYMENT_ID });
  assert(metadata.tierCount === 3, "metadata tier count");
  assert(metadata.capabilityBindings >= 7, "metadata capability bindings");

  const validation = validateCommercialFoundation({ deploymentId: DEPLOYMENT_ID });
  assert(validation.foundationOk, "foundation validation");

  console.log("✓ commercial metadata & foundation");
  console.log(" ", metadata.summary);
  console.log("\n✅ V64 P1 Commercial Productization Foundation — verify PASS");
}

function main() {
  console.log("V64 P1 Commercial Productization Foundation Verification\n");
  checkModuleStructure();
  testProductAndPricingConfig();
  testFeatureMatrixAndPlanRegistry();
  testCapabilityMapping();
  testFoundationAndMetadata();
}

main();
