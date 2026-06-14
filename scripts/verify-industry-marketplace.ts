/**
 * V35 Industry Marketplace Foundation — Phase 1 verification
 */
import {
  buildIndustryMarketplace,
  buildMarketplaceContext,
  CANONICAL_MARKETPLACE_QUERY,
  CANONICAL_MARKETPLACE_SUBJECT_ID,
  executeMarketplaceQuery,
  findBrandMarketplace,
  findPartnershipMarketplace,
  findSupplierMarketplace,
  findTenderMarketplace,
  findTopMarketplace,
  getMarketplaceBySubject,
  INDUSTRY_MARKETPLACE_TAG,
  INDUSTRY_MARKETPLACE_VERSION,
  TOP_MARKETPLACE_SCORE_THRESHOLD,
  validateIndustryMarketplace,
  validateMarketplaceContextRegistry,
  validateMarketplaceContextState,
  validateMarketplaceQueryRegistry,
  validateMarketplaceRegistry,
} from "../lib/industry-marketplace";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testMarketplaceRegistry() {
  const result = validateMarketplaceRegistry();
  assert(result.valid, "marketplace registry valid");
  assert(result.count >= 8, "marketplace count");

  const marketplaceRecords = buildIndustryMarketplace();
  assert(
    marketplaceRecords.every(
      (record) =>
        record.crmId.length > 0 &&
        record.score.totalMarketplaceScore > 0 &&
        record.score.matchingScore > 0,
    ),
    "marketplace records derived from crm",
  );

  console.log("✓ marketplace registry");
  console.log(" ", result.summary);
}

function testMarketplaceContext() {
  const result = validateMarketplaceContextRegistry();
  assert(result.valid, "marketplace context registry valid");

  const context = buildMarketplaceContext();
  assert(validateMarketplaceContextState(context), "marketplace context valid");
  assert(context.marketplaceReady, "marketplace ready");

  console.log("✓ marketplace context");
  console.log(" ", result.summary);
}

function testMarketplaceQuery() {
  const result = validateMarketplaceQueryRegistry();
  assert(result.valid, "marketplace query registry valid");

  const canonical = executeMarketplaceQuery(CANONICAL_MARKETPLACE_QUERY);
  const suppliers = findSupplierMarketplace(3);
  const brands = findBrandMarketplace(3);
  const tenders = findTenderMarketplace(3);
  const partnerships = findPartnershipMarketplace(3);
  const top = findTopMarketplace(5);
  const subject = getMarketplaceBySubject(CANONICAL_MARKETPLACE_SUBJECT_ID);

  assert(canonical.marketplaceReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierMarketplace");
  assert(brands.hitCount >= 1, "findBrandMarketplace");
  assert(tenders.hitCount >= 2, "findTenderMarketplace");
  assert(partnerships.hitCount >= 1, "findPartnershipMarketplace");
  assert(top.hitCount >= 3, "findTopMarketplace");
  assert(subject.length >= 1, "subject marketplace records");

  const topRecord = top.marketplaceRecords[0]!;
  assert(topRecord.score.totalMarketplaceScore >= TOP_MARKETPLACE_SCORE_THRESHOLD, "top threshold");
  assert(
    topRecord.score.visibilityScore > 0 &&
      topRecord.score.matchingScore > 0 &&
      topRecord.score.transactionScore > 0 &&
      topRecord.score.retentionScore > 0 &&
      topRecord.score.confidenceScore > 0,
    "marketplace score dimensions",
  );

  console.log("✓ marketplace query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topRecord.score.totalMarketplaceScore}`,
  );
}

function testIndustryMarketplace() {
  const validation = validateIndustryMarketplace();
  assert(validation.valid, "industry marketplace validation");
  assert(INDUSTRY_MARKETPLACE_VERSION === "v35-industry-marketplace-1", "marketplace version");
  assert(INDUSTRY_MARKETPLACE_TAG === "v35-industry-marketplace-foundation", "marketplace tag");

  console.log("✓ industry marketplace validation");
  console.log(
    " ",
    `registry=${validation.marketplaceRegistry.valid} context=${validation.marketplaceContext.valid} query=${validation.marketplaceQuery.valid}`,
  );
}

testMarketplaceRegistry();
testMarketplaceContext();
testMarketplaceQuery();
testIndustryMarketplace();
console.log("Industry Marketplace Foundation PASS");
