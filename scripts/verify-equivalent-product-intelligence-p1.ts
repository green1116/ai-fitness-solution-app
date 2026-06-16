/**
 * V42 Equivalent Product Intelligence — Phase 1 verification
 */
import {
  buildProductRegistry,
  buildProductSpecContext,
  buildRequirementSpecificationEdges,
  buildSpecificationRegistry,
  CANONICAL_EQUIVALENT_TENDER_ID,
  EPI_P1_TAG,
  EPI_VERSION,
  findProductsBySpecification,
  findSpecificationsByRequirement,
  getEquivalentProductIntelligencePhase1FreezeMeta,
  validateEquivalentProductIntelligencePhase1,
} from "../lib/equivalent-product-intelligence";
import { findRequirementByTender } from "../lib/requirement-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateEquivalentProductIntelligencePhase1();
assert(validation.valid, "phase1 validation");
assert(validation.productSpec.valid, "product spec validation");

const products = buildProductRegistry();
assert(products.products.length >= 15, "product count");
assert(new Set(products.products.map((p) => p.id)).size === products.products.length, "product id unique");
assert(new Set(products.products.map((p) => p.skuId)).size === products.products.length, "sku unique");
assert(products.products.some((p) => p.source === "catalog"), "catalog source");
assert(products.products.some((p) => p.source === "real-catalog"), "real-catalog source");

console.log("✓ product registry");
console.log(`  products=${products.products.length} valid=${validation.productSpec.valid}`);

const specifications = buildSpecificationRegistry();
assert(specifications.specifications.length >= 30, "specification count");
assert(
  specifications.specifications.some((s) => s.source === "requirement"),
  "requirement source",
);
assert(
  specifications.specifications.some((s) => s.source === "equipment-intelligence"),
  "equipment-intelligence source",
);

console.log("✓ specification registry");
console.log(`  specifications=${specifications.specifications.length} valid=${validation.productSpec.valid}`);

const edges = buildRequirementSpecificationEdges();
assert(edges.length >= 30, "edge count");
assert(edges.every((edge) => edge.confidence >= 0 && edge.confidence <= 100), "edge confidence range");

console.log("✓ requirement-spec edge");
console.log(`  edges=${edges.length} valid=${validation.productSpec.valid}`);

const context = buildProductSpecContext();
assert(context.contextReady, "product spec context ready");
assert(context.products.length === products.products.length, "context product count");
assert(context.specifications.length === specifications.specifications.length, "context spec count");
assert(context.edges.length === edges.length, "context edge count");
assert(context.products.some((p) => p.specifications.length > 0), "product spec links");

console.log("✓ product-spec context");
console.log(`  ready=${context.contextReady} linked=${validation.productSpec.linkedProductCount}`);

const tenderRequirements = findRequirementByTender(CANONICAL_EQUIVALENT_TENDER_ID);
assert(tenderRequirements.length >= 1, "canonical tender requirements");

const sampleRequirement = tenderRequirements[0]!;
const requirementSpecs = findSpecificationsByRequirement(sampleRequirement.requirementId);
assert(requirementSpecs.length >= 1, "findSpecificationsByRequirement");

const sampleSpec = requirementSpecs[0]!;
const specProducts = findProductsBySpecification(sampleSpec.id);
assert(specProducts.length >= 1, "findProductsBySpecification");

const freeze = getEquivalentProductIntelligencePhase1FreezeMeta();
assert(freeze.valid, "freeze meta valid");
assert(freeze.tag === EPI_P1_TAG, "freeze tag");
assert(freeze.version === EPI_VERSION, "freeze version");

console.log("✓ equivalent product intelligence p1");
console.log(`  tag=${freeze.tag}`);
console.log("EPI P1 VERIFY PASS");
