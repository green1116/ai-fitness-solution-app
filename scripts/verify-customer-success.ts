/**
 * V8.6 Customer Success Platform — verification
 */
import {
  CUSTOMER_SUCCESS_VERSION,
  buildCustomerHealth,
  buildAdoptionMetrics,
  buildEngagementProfile,
  buildRenewalProfile,
  buildSuccessSummary,
  buildCustomerSuccessResponse,
  validateCustomerSuccess,
} from "../lib/productization/success";

const DEPLOYMENT_ID = "v86-customer-success-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testHealth() {
  const health = buildCustomerHealth({ deploymentId: DEPLOYMENT_ID });
  assert(health.healthId.length > 0, "health id");
  assert(health.customerId.length > 0, "customer id");
  assert(["healthy", "attention", "at-risk", "critical"].includes(health.status), "health status");
  assert(health.score >= 0 && health.score <= 100, "health score");
  assert(health.summary.length > 0, "health summary");
  console.log("✓ health valid");
}

function testAdoption() {
  const adoption = buildAdoptionMetrics({ deploymentId: DEPLOYMENT_ID });
  assert(adoption.metricsId.length > 0, "adoption id");
  assert(adoption.workspaceUtilization >= 0, "workspace utilization");
  assert(adoption.activeUsers >= 0, "active users");
  assert(adoption.generatedPlans >= 0, "generated plans");
  assert(adoption.generatedBudgets >= 0, "generated budgets");
  assert(adoption.proposalExports >= 0, "proposal exports");
  assert(adoption.tenderExports >= 0, "tender exports");
  console.log("✓ adoption valid");
}

function testEngagement() {
  const engagement = buildEngagementProfile({ deploymentId: DEPLOYMENT_ID });
  assert(engagement.profileId.length > 0, "engagement id");
  assert(engagement.loginFrequency >= 0, "login frequency");
  assert(engagement.featureUsage >= 0, "feature usage");
  assert(engagement.projectActivity >= 0, "project activity");
  assert(engagement.deliveryParticipation >= 0, "delivery participation");
  console.log("✓ engagement valid");
}

function testRenewal() {
  const renewal = buildRenewalProfile({ deploymentId: DEPLOYMENT_ID });
  assert(renewal.profileId.length > 0, "renewal id");
  assert(renewal.renewalProbability >= 0, "renewal probability");
  assert(renewal.expansionOpportunity >= 0, "expansion opportunity");
  assert(renewal.riskIndicators.length > 0, "risk indicators");
  assert(renewal.recommendations.length > 0, "recommendations");
  console.log("✓ renewal valid");
}

function testSummaryAndResponse() {
  const summary = buildSuccessSummary({ deploymentId: DEPLOYMENT_ID });
  assert(summary.version === CUSTOMER_SUCCESS_VERSION, "summary version");
  assert(summary.summaryId.length > 0, "summary id");
  assert(summary.successScore.overallScore >= 0, "overall score");
  assert(summary.summary.length > 0, "summary text");
  console.log("✓ summary valid");
  console.log(" ", summary.summary);

  const response = buildCustomerSuccessResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.health.customerId === summary.customerId, "response customer");
  assert(response.adoption.metricsId.length > 0, "response adoption");
  assert(response.engagement.profileId.length > 0, "response engagement");
  assert(response.renewal.profileId.length > 0, "response renewal");

  const validation = validateCustomerSuccess({ deploymentId: DEPLOYMENT_ID });
  assert(validation.healthValid, "health valid");
  assert(validation.adoptionValid, "adoption valid");
  assert(validation.engagementValid, "engagement valid");
  assert(validation.renewalValid, "renewal valid");
  assert(validation.summaryValid, "summary valid");

  console.log("");
  console.log("CUSTOMER SUCCESS VERIFY PASS");
}

function main() {
  testHealth();
  testAdoption();
  testEngagement();
  testRenewal();
  testSummaryAndResponse();
}

main();
