/**
 * V47 Commercial Products — Quote Core verification
 */
import {
  checkProductEligibility,
  createQuote,
  validateCommercialQuote,
} from "../lib/commercial-products/access-layer";
import { PRODUCT_SKU } from "../lib/commercial-products/shared/constants";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const sampleRequest = {
  sku: "kickstart-package" as const,
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
  slaTier: "7d" as const,
};

const ineligibleRequest = {
  ...sampleRequest,
  areaSqm: 40,
  headcount: 10,
  budgetCny: 50_000,
};

assert(PRODUCT_SKU.includes(sampleRequest.sku), "sku exists");
console.log("✓ quote api ok");
console.log(`  sku=${sampleRequest.sku}`);

const eligibility = checkProductEligibility(sampleRequest.sku, sampleRequest);
assert(eligibility.eligible === true, "eligible sample");
assert(eligibility.reasons.length === 0, "no eligibility reasons");

const ineligible = checkProductEligibility(ineligibleRequest.sku, ineligibleRequest);
assert(ineligible.eligible === false, "ineligible sample");
assert(ineligible.reasons.length > 0, "ineligibility reasons");

console.log("✓ eligibility ok");
console.log(`  eligible=${eligibility.eligible} blocked=${ineligible.reasons.length}`);

const quote = createQuote(sampleRequest);
assert(quote.ok === true, "quote response ok");
assert(quote.pricing.suggestedPriceCny >= quote.pricing.priceMinCny, "pricing min");
assert(quote.pricing.suggestedPriceCny <= quote.pricing.priceMaxCny, "pricing max");
assert(quote.sla.tier === sampleRequest.slaTier, "sla assigned");

console.log("✓ pricing ok");
console.log(
  `  suggestedPrice=${quote.pricing.suggestedPriceCny} range=${quote.pricing.priceMinCny}-${quote.pricing.priceMaxCny}`,
);

assert(quote.snapshot.quoteId === quote.pricing.quoteId, "snapshot quoteId");
assert(quote.snapshot.price === quote.pricing.suggestedPriceCny, "snapshot price");
assert(quote.snapshot.sla === quote.sla.tier, "snapshot sla");
assert(quote.snapshot.eligible === true, "snapshot eligible");
assert(quote.snapshot.createdAt.length > 0, "snapshot createdAt");

console.log("✓ snapshot ok");
console.log(`  quoteId=${quote.snapshot.quoteId} sla=${quote.snapshot.sla}`);

const validation = validateCommercialQuote({ snapshot: quote.snapshot });
assert(validation.valid, "commercial quote validation");
assert(validation.skuExists, "validation sku");
assert(validation.eligibilityReady, "validation eligibility");
assert(validation.pricingReady, "validation pricing");
assert(validation.slaReady, "validation sla");
assert(validation.snapshotReady, "validation snapshot");

console.log("✓ commercial quote validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("COMMERCIAL QUOTE PASS");
