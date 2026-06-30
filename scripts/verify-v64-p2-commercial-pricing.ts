/**
 * V64 P2 — Commercial Pricing Layer Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_PRICING_LAYER_VERSION,
  buildCommercialPricingSnapshot,
  getCommercialCurrencyMetadata,
  lookupAllPlanPrices,
  lookupPlanPriceByProductTier,
  lookupPlanPriceBySaasPlan,
  lookupPlanPriceByUserTier,
  normalizePlanPrice,
  validateCommercialPricing,
} from "../lib/commercial/v64/pricing";
import { PRICING_TIERS } from "../lib/growth/conversion/pricing.strategy";
import { commercialTierAmountCents } from "../lib/commercial/pricing";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p2-commercial-pricing-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/pricing.ts",
    "lib/commercial/v64/pricing.types.ts",
    "lib/commercial/v64/pricing.currency.ts",
    "lib/commercial/v64/pricing.normalize.ts",
    "lib/commercial/v64/pricing.lookup.ts",
    "lib/commercial/v64/pricing.snapshot.ts",
    "lib/commercial/v64/pricing.validate.ts",
    "docs/production/V64-PRICING-LAYER.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 pricing layer module structure");
}

function testCurrencyAndNormalization() {
  const currency = getCommercialCurrencyMetadata();
  assert(currency.code === "CNY", "currency code");
  assert(currency.symbol === "¥", "currency symbol");
  assert(currency.minorUnit === 2, "currency minor unit");

  const starter = normalizePlanPrice("starter");
  assert(starter.displayPriceCny === PRICING_TIERS.BASIC.monthlyPriceCny, "starter display");
  assert(starter.referencePriceCents === null, "starter no one-time ref");
  assert(starter.displayPriceLabel.includes("/月"), "starter display label");

  const pro = normalizePlanPrice("professional");
  assert(pro.displayPriceCny === PRICING_TIERS.PRO.monthlyPriceCny, "pro display");
  assert(pro.referencePriceCents === commercialTierAmountCents("pro"), "pro one-time ref");

  const enterprise = normalizePlanPrice("enterprise");
  assert(
    enterprise.referencePriceCents === commercialTierAmountCents("enterprise"),
    "enterprise one-time ref",
  );

  console.log("✓ currency metadata & price normalization");
}

function testLookupAndSnapshot() {
  const byProduct = lookupPlanPriceByProductTier("professional");
  assert(byProduct.saasPlan === "PRO", "lookup product tier");

  const bySaas = lookupPlanPriceBySaasPlan("ENTERPRISE");
  assert(bySaas.productTier === "enterprise", "lookup saas plan");

  const byUser = lookupPlanPriceByUserTier("pro");
  assert(byUser?.productTier === "professional", "lookup user tier");

  const all = lookupAllPlanPrices();
  assert(all.length === 3, "lookup all plans");

  const snapshot = buildCommercialPricingSnapshot({ deploymentId: DEPLOYMENT_ID });
  assert(snapshot.version === V64_PRICING_LAYER_VERSION, "snapshot version");
  assert(snapshot.plans.length === 3, "snapshot plans");
  assert(snapshot.currency.code === "CNY", "snapshot currency");
  assert(snapshot.generatedAt.length > 0, "snapshot timestamp");

  console.log("✓ pricing lookup & snapshot");
  console.log(" ", snapshot.summary);
}

function testValidation() {
  const validation = validateCommercialPricing({ deploymentId: DEPLOYMENT_ID });
  assert(validation.currencyOk, "validation currency");
  assert(validation.plansOk, "validation plans");
  assert(validation.displayPricesOk, "validation display prices");
  assert(validation.referencePricesOk, "validation reference prices");
  assert(validation.catalogLabelsOk, "validation catalog labels");
  assert(validation.backwardCompatible, "validation backward compatible");
  assert(validation.pricingOk, "validation pricing ok");

  console.log("✓ pricing validation");
  console.log("\n✅ V64 P2 Commercial Pricing Layer — verify PASS");
}

function main() {
  console.log("V64 P2 Commercial Pricing Layer Verification\n");
  checkModuleStructure();
  testCurrencyAndNormalization();
  testLookupAndSnapshot();
  testValidation();
}

main();
