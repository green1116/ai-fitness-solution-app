/**
 * V35 Industry Marketplace Intelligence — Phase 2 verification
 */
import {
  buildMarketplaceIntelligence,
  buildOpportunityRanking,
  CANONICAL_MARKETPLACE_INTELLIGENCE_QUERY,
  CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID,
  executeMarketplaceIntelligenceQuery,
  INDUSTRY_MARKETPLACE_INTELLIGENCE_TAG,
  INDUSTRY_MARKETPLACE_INTELLIGENCE_VERSION,
  rankBrandMarketplacePriority,
  rankPartnershipMarketplacePriority,
  rankSupplierMarketplacePriority,
  rankTenderMarketplacePriority,
  recommendBrandMarketplace,
  recommendPartnershipMarketplace,
  recommendSupplierMarketplace,
  recommendTenderMarketplace,
  recommendTopMarketplace,
  TOP_MARKETPLACE_INTELLIGENCE_THRESHOLD,
  validateIndustryMarketplaceIntelligence,
  validateMarketplaceIntelligenceRegistry,
  validateMarketplaceIntelligenceState,
  validateMarketplaceRankingRegistry,
  validateMarketplaceRecommendationRegistry,
  validateMarketplaceRoutingRegistry,
  validateMarketplaceSignalRegistry,
} from "../lib/industry-marketplace-intelligence";
import { validateIndustryMarketplace } from "../lib/industry-marketplace";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testMarketplaceSignals() {
  const result = validateMarketplaceSignalRegistry();
  assert(result.valid, "marketplace signal registry valid");
  assert(result.count >= 8, "marketplace signal count");

  console.log("✓ marketplace signals");
  console.log(" ", result.summary);
}

function testMarketplaceRankings() {
  const result = validateMarketplaceRankingRegistry();
  assert(result.valid, "marketplace ranking registry valid");

  const suppliers = rankSupplierMarketplacePriority(3);
  const brands = rankBrandMarketplacePriority(3);
  const tenders = rankTenderMarketplacePriority(3);
  const partnerships = rankPartnershipMarketplacePriority(3);
  const opportunity = buildOpportunityRanking(undefined, 5);

  assert(suppliers.rankingReady, "rankSupplierMarketplacePriority");
  assert(brands.rankingReady, "rankBrandMarketplacePriority");
  assert(tenders.rankingReady, "rankTenderMarketplacePriority");
  assert(partnerships.rankingReady, "rankPartnershipMarketplacePriority");
  assert(opportunity.entries.length >= 3, "opportunity ranking");
  assert(
    opportunity.entries.every(
      (entry, index, entries) =>
        index === 0 || entries[index - 1]!.priorityScore >= entry.priorityScore,
    ),
    "opportunity ranking order",
  );

  console.log("✓ marketplace rankings");
  console.log(" ", result.summary);
}

function testMarketplaceRouting() {
  const result = validateMarketplaceRoutingRegistry();
  assert(result.valid, "marketplace routing registry valid");
  assert(result.count === 4, "marketplace routing count");

  console.log("✓ marketplace routing");
  console.log(" ", result.summary);
}

function testMarketplaceRecommendations() {
  const result = validateMarketplaceRecommendationRegistry();
  assert(result.valid, "marketplace recommendation registry valid");

  const suppliers = recommendSupplierMarketplace(3);
  const brands = recommendBrandMarketplace(3);
  const tenders = recommendTenderMarketplace(3);
  const partnerships = recommendPartnershipMarketplace(3);
  const top = recommendTopMarketplace(5);

  assert(suppliers.length >= 1, "recommendSupplierMarketplace");
  assert(brands.length >= 1, "recommendBrandMarketplace");
  assert(tenders.length >= 1, "recommendTenderMarketplace");
  assert(partnerships.length >= 1, "recommendPartnershipMarketplace");
  assert(top.length >= 3, "recommendTopMarketplace");

  const topRecommendation = top[0]!;
  assert(topRecommendation.compositePriority > 0, "top composite priority");
  assert(
    topRecommendation.opportunityPriority > 0 &&
      topRecommendation.matchingPriority > 0 &&
      topRecommendation.conversionPriority > 0 &&
      topRecommendation.retentionPriority > 0,
    "recommendation priority dimensions",
  );

  console.log("✓ marketplace recommendations");
  console.log(" ", result.summary);
  console.log(
    " ",
    `suppliers=${suppliers.length} tenders=${tenders.length} top=${top.length} topPriority=${topRecommendation.compositePriority}`,
  );
}

function testMarketplaceIntelligence() {
  const result = validateMarketplaceIntelligenceRegistry();
  assert(result.valid, "marketplace intelligence registry valid");

  const intelligence = buildMarketplaceIntelligence();
  assert(validateMarketplaceIntelligenceState(intelligence), "marketplace intelligence state");
  assert(intelligence.intelligenceReady, "marketplace intelligence ready");

  const canonical = executeMarketplaceIntelligenceQuery(CANONICAL_MARKETPLACE_INTELLIGENCE_QUERY);
  assert(canonical.intelligenceReady, "canonical intelligence query");
  assert(canonical.hitCount >= 1, "canonical intelligence hits");

  const validation = validateIndustryMarketplaceIntelligence();
  assert(validation.valid, "industry marketplace intelligence validation");
  assert(
    INDUSTRY_MARKETPLACE_INTELLIGENCE_VERSION === "v35-industry-marketplace-intelligence-1",
    "marketplace intelligence version",
  );
  assert(
    INDUSTRY_MARKETPLACE_INTELLIGENCE_TAG === "v35-industry-marketplace-intelligence-foundation",
    "marketplace intelligence tag",
  );

  const marketplaceValidation = validateIndustryMarketplace();
  assert(marketplaceValidation.valid, "underlying marketplace layer unchanged");

  console.log("✓ marketplace intelligence");
  console.log(" ", result.summary);
  console.log(
    " ",
    `signals=${validation.signalRegistry.valid} rankings=${validation.rankingRegistry.valid} routing=${validation.routingRegistry.valid} recommendations=${validation.recommendationRegistry.valid} canonicalSubject=${CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID} threshold=${TOP_MARKETPLACE_INTELLIGENCE_THRESHOLD}`,
  );
}

testMarketplaceSignals();
testMarketplaceRankings();
testMarketplaceRouting();
testMarketplaceRecommendations();
testMarketplaceIntelligence();
console.log("Industry Marketplace Intelligence PASS");
