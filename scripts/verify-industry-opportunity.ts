/**
 * V33 Industry Opportunity Foundation — Phase 2 verification
 */
import {
  buildIndustryOpportunities,
  buildOpportunityContext,
  CANONICAL_OPPORTUNITY_QUERY,
  CANONICAL_OPPORTUNITY_SUBJECT_ID,
  executeOpportunityQuery,
  findBrandOpportunities,
  findHighPriorityOpportunities,
  findPartnershipOpportunities,
  findSupplierOpportunities,
  findTenderOpportunities,
  getOpportunitiesBySubject,
  HIGH_PRIORITY_SCORE_THRESHOLD,
  INDUSTRY_OPPORTUNITY_TAG,
  INDUSTRY_OPPORTUNITY_VERSION,
  validateIndustryOpportunity,
  validateOpportunityContextRegistry,
  validateOpportunityContextState,
  validateOpportunityQueryRegistry,
  validateOpportunityRegistry,
} from "../lib/industry-opportunity";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testOpportunityRegistry() {
  const result = validateOpportunityRegistry();
  assert(result.valid, "opportunity registry valid");
  assert(result.count >= 8, "opportunity count");

  const opportunities = buildIndustryOpportunities();
  assert(
    opportunities.every(
      (opportunity) =>
        opportunity.insightIds.length > 0 &&
        opportunity.score.totalScore > 0,
    ),
    "opportunities derived from insights",
  );

  console.log("✓ opportunity registry");
  console.log(" ", result.summary);
}

function testOpportunityContext() {
  const result = validateOpportunityContextRegistry();
  assert(result.valid, "opportunity context registry valid");

  const context = buildOpportunityContext();
  assert(validateOpportunityContextState(context), "opportunity context valid");
  assert(context.opportunityReady, "opportunity ready");

  console.log("✓ opportunity context");
  console.log(" ", result.summary);
}

function testOpportunityQuery() {
  const result = validateOpportunityQueryRegistry();
  assert(result.valid, "opportunity query registry valid");

  const canonical = executeOpportunityQuery(CANONICAL_OPPORTUNITY_QUERY);
  const suppliers = findSupplierOpportunities(3);
  const brands = findBrandOpportunities(3);
  const tenders = findTenderOpportunities(3);
  const partnerships = findPartnershipOpportunities(3);
  const highPriority = findHighPriorityOpportunities(5);
  const subject = getOpportunitiesBySubject(CANONICAL_OPPORTUNITY_SUBJECT_ID);

  assert(canonical.opportunityReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierOpportunities");
  assert(brands.hitCount >= 1, "findBrandOpportunities");
  assert(tenders.hitCount >= 2, "findTenderOpportunities");
  assert(partnerships.hitCount >= 1, "findPartnershipOpportunities");
  assert(highPriority.hitCount >= 3, "findHighPriorityOpportunities");
  assert(subject.length >= 1, "subject opportunities");

  const top = highPriority.opportunities[0]!;
  assert(top.score.totalScore >= HIGH_PRIORITY_SCORE_THRESHOLD, "high priority threshold");
  assert(top.score.impact > 0 && top.score.confidence > 0, "score dimensions");
  assert(top.score.urgency > 0 && top.score.networkEffect > 0, "score dimensions");

  console.log("✓ opportunity query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} highPriority=${highPriority.hitCount} topScore=${top.score.totalScore}`,
  );
}

function testIndustryOpportunity() {
  const validation = validateIndustryOpportunity();
  assert(validation.valid, "industry opportunity validation");
  assert(INDUSTRY_OPPORTUNITY_VERSION === "v33-industry-opportunity-1", "opportunity version");
  assert(
    INDUSTRY_OPPORTUNITY_TAG === "v33-industry-opportunity-foundation",
    "opportunity tag",
  );

  console.log("✓ industry opportunity validation");
  console.log(
    " ",
    `registry=${validation.opportunityRegistry.valid} context=${validation.opportunityContext.valid} query=${validation.opportunityQuery.valid}`,
  );
}

testOpportunityRegistry();
testOpportunityContext();
testOpportunityQuery();
testIndustryOpportunity();
console.log("Industry Opportunity Foundation PASS");
