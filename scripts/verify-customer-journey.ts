/**
 * V8.2 Customer Journey Foundation — verification
 */
import {
  CUSTOMER_JOURNEY_VERSION,
  buildJourneyStages,
  buildJourneyTransitions,
  validateTransitions,
  buildJourneyProfile,
  buildConversionMetrics,
  buildJourneyAnalytics,
  buildCustomerJourney,
  buildCustomerJourneyResponse,
  validateJourney,
} from "../lib/productization/journey";

const DEPLOYMENT_ID = "v82-customer-journey-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testStages() {
  const stages = buildJourneyStages();
  assert(stages.length === 9, "stages count");
  const kinds = stages.map((s) => s.kind);
  assert(kinds.includes("lead"), "lead stage");
  assert(kinds.includes("qualified-lead"), "qualified lead stage");
  assert(kinds.includes("demo-requested"), "demo requested stage");
  assert(kinds.includes("proposal-generated"), "proposal generated stage");
  assert(kinds.includes("trial-started"), "trial started stage");
  assert(kinds.includes("evaluation"), "evaluation stage");
  assert(kinds.includes("commercial-negotiation"), "commercial negotiation stage");
  assert(kinds.includes("won"), "won stage");
  assert(kinds.includes("lost"), "lost stage");

  for (const stage of stages) {
    assert(stage.id.length > 0, "stage id");
    assert(stage.label.length > 0, "stage label");
    assert(stage.order > 0, "stage order");
  }

  const terminal = stages.filter((s) => s.terminal);
  assert(terminal.length === 2, "terminal stages");
  assert(terminal.some((s) => s.kind === "won"), "won terminal");
  assert(terminal.some((s) => s.kind === "lost"), "lost terminal");

  console.log("✓ journey stages");
  console.log(" ", `stages=${stages.length} terminal=${terminal.length}`);
}

function testTransitions() {
  const transitions = buildJourneyTransitions();
  assert(transitions.length === 8, "transitions count");
  assert(validateTransitions(), "transitions valid");

  const flow = [
    "lead",
    "qualified-lead",
    "demo-requested",
    "proposal-generated",
    "trial-started",
    "evaluation",
    "commercial-negotiation",
  ] as const;

  for (let i = 0; i < flow.length - 1; i += 1) {
    const from = flow[i];
    const to = flow[i + 1];
    assert(
      transitions.some((t) => t.from === from && t.to === to),
      `transition ${from} → ${to}`,
    );
  }

  assert(
    transitions.some((t) => t.from === "commercial-negotiation" && t.to === "won"),
    "won transition",
  );
  assert(
    transitions.some((t) => t.from === "commercial-negotiation" && t.to === "lost"),
    "lost transition",
  );

  console.log("✓ journey transitions");
  console.log(" ", `transitions=${transitions.length} valid=true`);
}

function testMetricsAndAnalytics() {
  const metrics = buildConversionMetrics({ deploymentId: DEPLOYMENT_ID });
  assert(metrics.leadCount > 0, "lead count");
  assert(metrics.demoRequests > 0, "demo requests");
  assert(metrics.proposalGenerated > 0, "proposal generated");
  assert(metrics.trialStarted > 0, "trial started");
  assert(metrics.evaluation > 0, "evaluation");
  assert(metrics.won >= 0, "won");
  assert(metrics.lost >= 0, "lost");
  assert(metrics.conversionRate >= 0, "conversion rate");
  assert(
    metrics.conversionRate === Math.round((metrics.won / metrics.leadCount) * 1000) / 10,
    "conversion rate formula",
  );

  const analytics = buildJourneyAnalytics({ deploymentId: DEPLOYMENT_ID });
  assert(analytics.version === CUSTOMER_JOURNEY_VERSION, "analytics version");
  assert(analytics.leadCount === metrics.leadCount, "analytics lead count");
  assert(analytics.demoRequests === metrics.demoRequests, "analytics demo requests");
  assert(analytics.proposalGenerated === metrics.proposalGenerated, "analytics proposals");
  assert(analytics.trialStarted === metrics.trialStarted, "analytics trials");
  assert(analytics.evaluation === metrics.evaluation, "analytics evaluation");
  assert(analytics.won === metrics.won, "analytics won");
  assert(analytics.lost === metrics.lost, "analytics lost");
  assert(analytics.conversionRate === metrics.conversionRate, "analytics conversion rate");
  assert(analytics.funnelDropOff.length > 0, "funnel drop off");

  console.log("✓ conversion metrics & analytics");
  console.log(" ", analytics.summary);
}

function testJourneyEngine() {
  const profile = buildJourneyProfile({ deploymentId: DEPLOYMENT_ID });
  assert(profile.version === CUSTOMER_JOURNEY_VERSION, "profile version");
  assert(profile.stages.length === 9, "profile stages");
  assert(profile.transitions.length === 8, "profile transitions");
  assert(profile.productName === "AI Fitness Solution", "product name");

  const journey = buildCustomerJourney({ deploymentId: DEPLOYMENT_ID });
  assert(journey.journeyId.length > 0, "journey id");
  assert(journey.metrics.leadCount > 0, "journey metrics");

  const response = buildCustomerJourneyResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.journey.journeyId === journey.journeyId, "response journey");
  assert(response.stages.length === 9, "response stages");
  assert(response.metrics.conversionRate >= 0, "response metrics");
  assert(response.analytics.leadCount > 0, "response analytics");

  const validation = validateJourney({ deploymentId: DEPLOYMENT_ID });
  assert(validation.stagesExist, "stages exist");
  assert(validation.transitionsValid, "transitions valid");
  assert(validation.analyticsValid, "analytics valid");
  assert(validation.conversionMetricsValid, "conversion metrics valid");

  console.log("✓ journey engine");
  console.log(" ", journey.summary);
  console.log("");
  console.log("CUSTOMER JOURNEY VERIFY PASS");
}

function main() {
  testStages();
  testTransitions();
  testMetricsAndAnalytics();
  testJourneyEngine();
}

main();
