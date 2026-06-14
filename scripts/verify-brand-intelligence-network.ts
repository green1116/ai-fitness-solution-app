/**
 * V38 Brand Intelligence Network — Phase 4 / Foundation verification
 */
import {
  BRAND_INTELLIGENCE_NETWORK_TAG,
  BRAND_INTELLIGENCE_NETWORK_VERSION,
  buildBrandDecisionContext,
  buildBrandEngineCompatibility,
  evaluateBrandEvidenceReadiness,
  executeBrandQuery,
  CANONICAL_BRAND_QUERY,
  findAuthorizedBrands,
  findBrands,
  findBrandsBySector,
  findBrandsByTier,
  findTopBrands,
  matchBrandToCatalog,
  matchBrandToProposal,
  matchBrandToSku,
  matchBrandToTender,
  rankBrandsForProposal,
  TOP_BRAND_SCORE_THRESHOLD,
  validateBrandIntelligenceNetworkFoundation,
} from "../lib/brand-intelligence-network";
import { buildCatalogRegistryRecords } from "../lib/product-catalog";
import { validateProductCatalogFoundation } from "../lib/product-catalog";
import { validateTenderProposalFoundation } from "../lib/tender-proposal";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateBrandIntelligenceNetworkFoundation();
assert(validation.valid, "foundation validation");

const canonical = executeBrandQuery(CANONICAL_BRAND_QUERY);
assert(canonical.brandReady, "canonical query");
assert(findBrands(10).hitCount >= 8, "findBrands");
assert(findBrandsBySector("gym-equipment", 5).hitCount >= 1, "findBrandsBySector");
assert(findBrandsByTier("premium", 5).hitCount >= 1, "findBrandsByTier");
assert(findAuthorizedBrands("East China", 5).hitCount >= 1, "findAuthorizedBrands");

const top = findTopBrands(5);
assert(top.hitCount >= 3, "findTopBrands");
assert(top.brands[0]!.score.totalBrandScore >= TOP_BRAND_SCORE_THRESHOLD, "top threshold");

const catalog = buildCatalogRegistryRecords()[0]!;
assert(matchBrandToSku("LF-T5-001").some((m) => m.matchReady), "matchBrandToSku");
assert(matchBrandToCatalog(catalog.catalogId).length >= 1, "matchBrandToCatalog");
assert(matchBrandToProposal(catalog.proposalId).length >= 1, "matchBrandToProposal");
assert(matchBrandToTender(catalog.tenderId).length >= 1, "matchBrandToTender");

const decision = buildBrandDecisionContext({
  tenderId: catalog.tenderId,
  proposalId: catalog.proposalId,
  catalogId: catalog.catalogId,
});
assert(decision.decisionReady, "brand decision context");
assert(rankBrandsForProposal(catalog.proposalId).length >= 1, "rankBrandsForProposal");
assert(evaluateBrandEvidenceReadiness("brand-life-fitness") >= 40, "evidence readiness");

const compat = buildBrandEngineCompatibility();
assert(compat.supplierNetworkLayer.length > 0, "engine compat");
assert(compat.evidenceIntelligenceLayer.length > 0, "v39 placeholder");

assert(validateTenderProposalFoundation().valid, "tender proposal unchanged");
assert(validateProductCatalogFoundation().valid, "product catalog unchanged");

console.log("✓ brand intelligence network foundation");
console.log(" ", validation.brandRegistry.summary);
console.log(" ", validation.evidenceLinkRegistry.summary);
console.log(" ", validation.brandQuery.summary);
console.log(" ", validation.brandDecision.summary);
console.log(
  " ",
  `registry=${validation.brandRegistry.valid} query=${validation.brandQuery.valid} decision=${validation.brandDecision.valid} compat=${validation.engineCompatibility.valid}`,
);
console.log(" ", `version=${BRAND_INTELLIGENCE_NETWORK_VERSION} tag=${BRAND_INTELLIGENCE_NETWORK_TAG}`);
console.log("Brand Intelligence Network Foundation PASS");
