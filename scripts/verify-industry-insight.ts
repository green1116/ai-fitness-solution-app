/**
 * V33 Industry Insight Foundation verification
 */
import {
  buildInsightContext,
  buildIndustryInsights,
  CANONICAL_INSIGHT_QUERY,
  CANONICAL_INSIGHT_SUBJECT_ID,
  executeInsightQuery,
  findGrowthSignals,
  findNetworkChanges,
  findOpportunities,
  findRisks,
  findTrends,
  getInsightsBySubject,
  INDUSTRY_INSIGHT_TAG,
  INDUSTRY_INSIGHT_VERSION,
  validateIndustryInsight,
  validateInsightContextRegistry,
  validateInsightContextState,
  validateInsightQueryRegistry,
  validateInsightRegistry,
} from "../lib/industry-insight";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testInsightRegistry() {
  const result = validateInsightRegistry();
  assert(result.valid, "insight registry valid");
  assert(result.count >= 10, "insight count");

  const insights = buildIndustryInsights();
  assert(
    insights.every(
      (insight) =>
        insight.observationIds.length > 0 &&
        (insight.signalIds.length > 0 || insight.eventIds.length > 0),
    ),
    "insights aggregate data network sources",
  );

  console.log("✓ insight registry");
  console.log(" ", result.summary);
}

function testInsightContext() {
  const result = validateInsightContextRegistry();
  assert(result.valid, "insight context registry valid");

  const context = buildInsightContext();
  assert(validateInsightContextState(context), "insight context valid");
  assert(context.insightReady, "insight ready");

  console.log("✓ insight context");
  console.log(" ", result.summary);
}

function testInsightQuery() {
  const result = validateInsightQueryRegistry();
  assert(result.valid, "insight query registry valid");

  const canonical = executeInsightQuery(CANONICAL_INSIGHT_QUERY);
  const trends = findTrends(3);
  const opportunities = findOpportunities(3);
  const risks = findRisks(3);
  const growth = findGrowthSignals(3);
  const networkChanges = findNetworkChanges(3);
  const subject = getInsightsBySubject(CANONICAL_INSIGHT_SUBJECT_ID);

  assert(canonical.insightReady, "canonical query ready");
  assert(trends.hitCount >= 2, "findTrends");
  assert(opportunities.hitCount >= 2, "findOpportunities");
  assert(risks.hitCount >= 1, "findRisks");
  assert(growth.hitCount >= 1, "findGrowthSignals");
  assert(networkChanges.hitCount >= 2, "findNetworkChanges");
  assert(subject.length >= 3, "subject insights");

  console.log("✓ insight query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} trends=${trends.hitCount} opportunities=${opportunities.hitCount} growth=${growth.hitCount}`,
  );
}

function testIndustryInsight() {
  const validation = validateIndustryInsight();
  assert(validation.valid, "industry insight validation");
  assert(INDUSTRY_INSIGHT_VERSION === "v33-industry-insight-1", "insight version");
  assert(INDUSTRY_INSIGHT_TAG === "v33-industry-insight-foundation", "insight tag");

  console.log("✓ industry insight validation");
  console.log(
    " ",
    `registry=${validation.insightRegistry.valid} context=${validation.insightContext.valid} query=${validation.insightQuery.valid}`,
  );
}

testInsightRegistry();
testInsightContext();
testInsightQuery();
testIndustryInsight();
console.log("Industry Insight Foundation PASS");
