/**
 * V47 Commercial Products — Sales Portal verification
 */
import {
  buildSalesPortalRegistry,
  buildSalesPortalView,
  createQuote,
  validateSalesPortal,
} from "../lib/commercial-products/access-layer";
import { CP_MIN_PORTAL_PRODUCT_COUNT, CP_QUOTE_API_PATH } from "../lib/commercial-products/access-layer/shared/constants";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const registry = buildSalesPortalRegistry();
assert(registry.count >= CP_MIN_PORTAL_PRODUCT_COUNT, "portal registry count");
assert(registry.records.every((record) => record.sku && record.name), "portal registry records");

console.log("✓ portal registry");
console.log(`  products=${registry.count}`);

const portal = buildSalesPortalView();
assert(portal.products.length >= CP_MIN_PORTAL_PRODUCT_COUNT, "portal builder products");
assert(portal.quoteApiPath === CP_QUOTE_API_PATH, "portal quote api path");
assert(portal.downloadApiPath.length > 0, "portal download api path");

console.log("✓ portal builder");
console.log(`  portalId=${portal.portalId} quoteApi=${portal.quoteApiPath}`);

const sampleRequest = {
  sku: portal.products[0]!.sku,
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
  slaTier: portal.products[0]!.defaultSla,
};

const quote = createQuote(sampleRequest);
assert(quote.ok === true, "quote form payload");
assert(quote.snapshot.quoteId.length > 0, "quote id");

console.log("✓ quote form");
console.log(`  sku=${sampleRequest.sku} quoteId=${quote.snapshot.quoteId}`);

assert(portal.quoteApiPath === "/api/commercial-products/quote", "quote api connected");

console.log("✓ quote api connected");
console.log(`  path=${portal.quoteApiPath}`);

assert(portal.products.length === 3, "product cards count");

console.log("✓ product cards=3");

const validation = validateSalesPortal();
assert(validation.valid, "sales portal validation");
assert(validation.productCount >= 3, "validation product count");
assert(validation.quoteApiRegistered, "validation quote api");
assert(validation.productCardsReady, "validation product cards");

console.log("✓ sales portal validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("COMMERCIAL PORTAL PASS");
