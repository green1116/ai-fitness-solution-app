/**
 * V8.1 Product Packaging — verification
 */
import {
  PRODUCT_PACKAGING_VERSION,
  buildProductCatalog,
  buildProductPlans,
  buildProductFeatures,
  buildPricingMatrix,
  buildPackagingProfile,
  buildFeatureMatrix,
  buildCommercialSummary,
  buildProductCatalogResponse,
  validatePackaging,
} from "../lib/productization/catalog";

const DEPLOYMENT_ID = "v81-product-packaging-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testCatalogAndPlans() {
  const catalog = buildProductCatalog({ deploymentId: DEPLOYMENT_ID });
  assert(catalog.version === PRODUCT_PACKAGING_VERSION, "catalog version");
  assert(catalog.catalogId.length > 0, "catalog id");
  assert(catalog.productName === "AI Fitness Solution", "product name");
  assert(catalog.totalTiers === 3, "total tiers");
  assert(catalog.products.length === 3, "products count");

  const plans = buildProductPlans();
  assert(plans.length === 3, "plans count");
  const tiers = plans.map((p) => p.tier);
  assert(tiers.includes("starter"), "starter plan");
  assert(tiers.includes("professional"), "professional plan");
  assert(tiers.includes("enterprise"), "enterprise plan");

  for (const plan of plans) {
    assert(plan.entitlements.planGeneration !== undefined, "plan generation entitlement");
    assert(plan.entitlements.budgetGeneration !== undefined, "budget generation entitlement");
    assert(typeof plan.entitlements.proposalPdf === "boolean", "proposal pdf entitlement");
    assert(typeof plan.entitlements.tenderPackage === "boolean", "tender package entitlement");
    assert(plan.entitlements.workspaceLimit !== undefined, "workspace limit");
    assert(plan.entitlements.userLimit !== undefined, "user limit");
    assert(plan.entitlements.supportLevel.length > 0, "support level");
    assert(plan.pricingModel === "custom", "custom pricing model");
    assert(plan.pricingLabel.includes("Custom pricing"), "custom pricing label");
  }

  console.log("✓ catalog & plans");
  console.log(" ", catalog.summary);
}

function testFeaturesAndPricing() {
  const features = buildProductFeatures();
  assert(features.length >= 7, "features count");
  const keys = features.map((f) => f.key);
  assert(keys.includes("planGeneration"), "plan generation feature");
  assert(keys.includes("budgetGeneration"), "budget generation feature");
  assert(keys.includes("proposalPdf"), "proposal pdf feature");
  assert(keys.includes("tenderPackage"), "tender package feature");
  assert(keys.includes("workspaceLimit"), "workspace limit feature");
  assert(keys.includes("userLimit"), "user limit feature");
  assert(keys.includes("supportLevel"), "support limit feature");

  for (const feature of features) {
    assert(feature.tiers.starter !== undefined, `starter mapping for ${feature.key}`);
    assert(feature.tiers.professional !== undefined, `professional mapping for ${feature.key}`);
    assert(feature.tiers.enterprise !== undefined, `enterprise mapping for ${feature.key}`);
  }

  const pricing = buildPricingMatrix({ deploymentId: DEPLOYMENT_ID });
  assert(pricing.entries.length === 3, "pricing entries");
  assert(pricing.entries.every((e) => e.model === "custom"), "custom pricing");
  assert(pricing.entries.every((e) => e.displayPrice === "Custom pricing"), "custom pricing placeholder");

  console.log("✓ features & pricing");
  console.log(" ", pricing.summary);
}

function testPackagingEngine() {
  const matrix = buildFeatureMatrix({ deploymentId: DEPLOYMENT_ID });
  assert(matrix.features.length >= 7, "feature matrix");
  assert(matrix.tiers.length === 3, "feature matrix tiers");

  for (const tier of ["starter", "professional", "enterprise"] as const) {
    const profile = buildPackagingProfile(tier, { deploymentId: DEPLOYMENT_ID });
    assert(profile.readyForSale, `${tier} ready for sale`);
    assert(profile.featureIds.length > 0, `${tier} feature ids`);
    assert(profile.product.tier === tier, `${tier} product tier`);
  }

  const summary = buildCommercialSummary({ deploymentId: DEPLOYMENT_ID });
  assert(summary.catalogReady, "catalog ready");
  assert(summary.packagingValid, "packaging valid");
  assert(summary.pricingModel === "custom", "commercial custom pricing");

  const validation = validatePackaging({ deploymentId: DEPLOYMENT_ID });
  assert(validation.catalogExists, "catalog exists");
  assert(validation.plansExist, "plans exist");
  assert(validation.featuresMapped, "features mapped");
  assert(validation.packagingValid, "packaging valid");

  const response = buildProductCatalogResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.catalog.products.length === 3, "response catalog");
  assert(response.plans.plans.length === 3, "response plans");
  assert(response.features.features.length >= 7, "response features");
  assert(response.commercialSummary.packagingValid, "response commercial summary");

  console.log("✓ packaging engine");
  console.log(" ", summary.summary);
  console.log("");
  console.log("PRODUCT PACKAGING VERIFY PASS");
}

function main() {
  testCatalogAndPlans();
  testFeaturesAndPricing();
  testPackagingEngine();
}

main();
