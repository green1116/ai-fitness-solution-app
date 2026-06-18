/**
 * V47 Commercial Products — Product Packaging Foundation verification
 */
import {
  assertProductCatalogReady,
  assignSla,
  buildDeliveryPackage,
  buildKickstartPackage,
  buildProductCatalog,
  buildSlaRegistry,
  buildTenderReadyPackage,
  calculatePricingQuote,
  CP_MIN_DELIVERABLE_COUNT,
  CP_MIN_PRODUCT_COUNT,
  validateProductPackagingFoundation,
} from "../lib/commercial-products";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const sampleInput = {
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
  slaTier: "7d" as const,
};

const catalog = buildProductCatalog();
assert(catalog.count >= CP_MIN_PRODUCT_COUNT, "product catalog count");
assert(assertProductCatalogReady(), "product catalog ready");
assert(catalog.records.every((record) => record.sku && record.deliverables.length > 0), "catalog fields");

console.log("✓ product catalog");
console.log(`  products=${catalog.count}`);

const kickstart = buildKickstartPackage(sampleInput);
const tenderReady = buildTenderReadyPackage(sampleInput);
const delivery = buildDeliveryPackage(sampleInput);

assert(kickstart.deliverables.length >= 3, "kickstart deliverables");
assert(tenderReady.deliverables.length > kickstart.deliverables.length, "tender deliverables");
assert(delivery.deliverables.length >= CP_MIN_DELIVERABLE_COUNT, "delivery deliverables");
assert(kickstart.intelligence.brandCount > 0, "intelligence snapshot");

console.log("✓ product packages");
console.log(
  `  kickstart=${kickstart.deliverables.length} tenderReady=${tenderReady.deliverables.length} delivery=${delivery.deliverables.length}`,
);

const quote = calculatePricingQuote({
  sku: "kickstart-package",
  input: sampleInput,
  complexity: "medium",
  slaTier: "7d",
});
assert(quote.suggestedPriceCny >= quote.priceMinCny, "pricing min");
assert(quote.suggestedPriceCny <= quote.priceMaxCny, "pricing max");

console.log("✓ pricing engine");
console.log(`  suggestedPrice=${quote.suggestedPriceCny} range=${quote.priceMinCny}-${quote.priceMaxCny}`);

const sla = assignSla({
  sku: "kickstart-package",
  tier: "48h",
  projectName: sampleInput.projectName,
});
assert(buildSlaRegistry().length === 4, "sla registry");
assert(sla.definition.deliveryHours === 48, "sla 48h");

console.log("✓ sla engine");
console.log(`  tier=${sla.tier} dueAt=${sla.dueAtIso}`);

assert(delivery.contract.projectName === sampleInput.projectName, "contract project");
assert(delivery.contract.paymentSchedule.length === 2, "contract payment schedule");
assert(delivery.contract.acceptanceCriteria.length > 0, "contract acceptance");

console.log("✓ contract template");
console.log(
  `  price=${delivery.contract.priceCny} scope=${delivery.contract.scope.length} acceptance=${delivery.contract.acceptanceCriteria.length}`,
);

const validation = validateProductPackagingFoundation();
assert(validation.valid, "product packaging validation");

console.log("✓ product packaging validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("PRODUCT PACKAGING FOUNDATION PASS");
