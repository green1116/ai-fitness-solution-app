/**
 * V8.9 Expansion & Renewal Platform — verification
 */
import {
  EXPANSION_RENEWAL_VERSION,
  buildRenewalOpportunity,
  buildExpansionOpportunity,
  buildExpansionOpportunities,
  buildRetentionProfile,
  buildGrowthMetrics,
  buildExpansionSummary,
  buildExpansionRenewalResponse,
  validateExpansionRenewal,
} from "../lib/productization/expansion";

const DEPLOYMENT_ID = "v89-expansion-renewal-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRenewal() {
  const renewal = buildRenewalOpportunity({ deploymentId: DEPLOYMENT_ID });
  assert(renewal.opportunityId.length > 0, "renewal id");
  assert(renewal.renewalProbability >= 0, "renewal probability");
  assert(renewal.renewalReadiness >= 0, "renewal readiness");
  assert(renewal.renewalValue >= 0, "renewal value");
  assert(renewal.renewalForecast >= 0, "renewal forecast");
  assert(renewal.currency === "CNY", "currency");
  console.log("✓ renewal valid");
  console.log(" ", renewal.summary);
}

function testExpansion() {
  const opportunities = buildExpansionOpportunities({ deploymentId: DEPLOYMENT_ID });
  assert(opportunities.length === 4, "expansion count");
  const kinds = opportunities.map((o) => o.kind);
  assert(kinds.includes("seat"), "seat expansion");
  assert(kinds.includes("workspace"), "workspace expansion");
  assert(kinds.includes("feature"), "feature expansion");
  assert(kinds.includes("enterprise-upgrade"), "enterprise upgrade");

  const single = buildExpansionOpportunity({
    deploymentId: DEPLOYMENT_ID,
    kind: "seat",
  });
  assert(single.kind === "seat", "single expansion kind");
  console.log("✓ expansion valid");
}

function testRetention() {
  const retention = buildRetentionProfile({ deploymentId: DEPLOYMENT_ID });
  assert(retention.profileId.length > 0, "retention id");
  assert(retention.retentionRate >= 0, "retention rate");
  assert(["low", "medium", "high"].includes(retention.churnRisk), "churn risk");
  assert(["improving", "stable", "declining"].includes(retention.customerHealth), "customer health");
  assert(["improving", "stable", "declining"].includes(retention.engagementTrend), "engagement trend");
  console.log("✓ retention valid");
}

function testGrowth() {
  const growth = buildGrowthMetrics({ deploymentId: DEPLOYMENT_ID });
  assert(growth.metricsId.length > 0, "growth id");
  assert(growth.upsellPotential >= 0, "upsell potential");
  assert(growth.crossSellPotential >= 0, "cross-sell potential");
  assert(growth.expansionArr >= 0, "expansion ARR");
  assert(growth.renewalArr >= 0, "renewal ARR");
  console.log("✓ growth valid");
  console.log(" ", growth.summary);
}

function testSummaryAndResponse() {
  const summary = buildExpansionSummary({ deploymentId: DEPLOYMENT_ID });
  assert(summary.version === EXPANSION_RENEWAL_VERSION, "summary version");
  assert(summary.summaryId.length > 0, "summary id");
  assert(summary.expansionOpportunityCount === 4, "expansion count in summary");

  const response = buildExpansionRenewalResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.renewal.opportunityId.length > 0, "response renewal");
  assert(response.expansion.length === 4, "response expansion");
  assert(response.retention.profileId.length > 0, "response retention");
  assert(response.growth.metricsId.length > 0, "response growth");

  const validation = validateExpansionRenewal({ deploymentId: DEPLOYMENT_ID });
  assert(validation.renewalValid, "renewal valid");
  assert(validation.expansionValid, "expansion valid");
  assert(validation.retentionValid, "retention valid");
  assert(validation.growthValid, "growth valid");
  assert(validation.summaryValid, "summary valid");

  console.log("✓ summary valid");
  console.log(" ", summary.summary);
  console.log("");
  console.log("EXPANSION RENEWAL VERIFY PASS");
}

function main() {
  testRenewal();
  testExpansion();
  testRetention();
  testGrowth();
  testSummaryAndResponse();
}

main();
