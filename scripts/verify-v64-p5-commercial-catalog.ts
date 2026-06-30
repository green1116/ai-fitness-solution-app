/**
 * V64 P5 — Commercial Product Catalog Layer Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_CATALOG_LAYER_VERSION,
  buildCommercialProductCatalogBundle,
  buildTierCatalogSnapshot,
  buildUnifiedCatalogExport,
  lookupAllTierCatalogEntries,
  lookupTierCatalogByProductTier,
  lookupTierCatalogBySaasPlan,
  lookupTierCatalogByPlanId,
  validateCommercialCatalog,
} from "../lib/commercial/v64/catalog";
import { PRODUCT_PACKAGING_VERSION } from "../lib/productization/catalog";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p5-commercial-catalog-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/catalog.ts",
    "lib/commercial/v64/catalog.types.ts",
    "lib/commercial/v64/catalog.builder.ts",
    "lib/commercial/v64/catalog.lookup.ts",
    "lib/commercial/v64/catalog.snapshot.ts",
    "lib/commercial/v64/catalog.export.ts",
    "lib/commercial/v64/catalog.validate.ts",
    "docs/production/V64-CATALOG-LAYER.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 catalog layer module structure");
}

function testBuilderAndLookup() {
  const bundle = buildCommercialProductCatalogBundle({ deploymentId: DEPLOYMENT_ID });
  assert(bundle.version === V64_CATALOG_LAYER_VERSION, "bundle version");
  assert(bundle.productName === "AI Fitness Solution", "product name");
  assert(bundle.tierEntries.length === 3, "tier entries");

  const pro = lookupTierCatalogBySaasPlan("PRO");
  assert(pro.productTier === "professional", "lookup by saas plan");
  assert(pro.normalizedPrice.displayPriceCny > 0, "normalized price attached");

  const byPlan = lookupTierCatalogByPlanId("plan-enterprise");
  assert(byPlan?.productTier === "enterprise", "lookup by plan id");

  const starter = lookupTierCatalogByProductTier("starter");
  assert(starter.packagingProfile.readyForSale, "packaging profile");

  const all = lookupAllTierCatalogEntries();
  assert(all.length === 3, "lookup all entries");

  console.log("✓ catalog builder & lookup");
  console.log(" ", bundle.summary);
}

function testSnapshotAndExport() {
  const snapshot = buildTierCatalogSnapshot({ deploymentId: DEPLOYMENT_ID });
  assert(snapshot.packagingVersion === PRODUCT_PACKAGING_VERSION, "packaging version");
  assert(snapshot.bundle.tierEntries.length === 3, "snapshot tier entries");
  assert(snapshot.generatedAt.length > 0, "snapshot timestamp");

  const exp = buildUnifiedCatalogExport({ deploymentId: DEPLOYMENT_ID });
  assert(exp.legacyCatalogResponse.catalog.products.length === 3, "legacy catalog export");
  assert(exp.backwardCompatible.packagingValid, "backward compatible packaging");
  assert(exp.bundle.catalogId.includes(DEPLOYMENT_ID), "export bundle id");

  console.log("✓ tier catalog snapshot & unified export");
  console.log(" ", exp.summary);
}

function testValidation() {
  const validation = validateCommercialCatalog({ deploymentId: DEPLOYMENT_ID });
  assert(validation.tierEntriesOk, "validation tier entries");
  assert(validation.productsOk, "validation products");
  assert(validation.plansOk, "validation plans");
  assert(validation.pricingOk, "validation pricing");
  assert(validation.capabilityOk, "validation capability");
  assert(validation.featureOk, "validation feature");
  assert(validation.packagingOk, "validation packaging");
  assert(validation.backwardCompatible, "validation backward compatible");
  assert(validation.catalogOk, "validation catalog ok");

  console.log("✓ catalog validation");
  console.log("\n✅ V64 P5 Commercial Product Catalog Layer — verify PASS");
}

function main() {
  console.log("V64 P5 Commercial Product Catalog Layer Verification\n");
  checkModuleStructure();
  testBuilderAndLookup();
  testSnapshotAndExport();
  testValidation();
}

main();
