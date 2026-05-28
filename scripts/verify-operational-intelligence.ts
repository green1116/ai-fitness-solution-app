/**
 * V4-A2 Operational Intelligence Runtime — verification
 */
import {
  V4A2_INTELLIGENCE_VERSION,
  OPERATIONAL_SIGNAL_KINDS,
  createOperationalSignalBatch,
  buildOperationalHealthSnapshot,
  detectOperationalAnomalies,
  analyzeOperationalTrends,
  identifyOperationalBottlenecks,
  summarizeOperationalBottlenecks,
  deriveOperationalInsights,
  summarizeOperationalInsights,
  generateOperationalRecommendations,
  summarizeOperationalRecommendations,
  buildOperationalDecisionSupport,
  summarizeOperationalDecisionSupport,
  buildV4OperationalIntelligenceRuntime,
  summarizeOperationalIntelligenceRuntime,
  warmOperationalIntelligenceContext,
} from "../lib/operations/intelligence/index";

const DEPLOYMENT_ID = "v4-verify-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testSignalsAndHealth() {
  const batch = createOperationalSignalBatch({ deploymentId: DEPLOYMENT_ID });
  assert(batch.signals.length === OPERATIONAL_SIGNAL_KINDS.length, "signals");
  const health = buildOperationalHealthSnapshot({ deploymentId: DEPLOYMENT_ID });
  assert(health.healthScore >= 80, "health score");
  console.log("✓ signals & health");
  console.log(" ", health.summary);
}

function testAnomaliesAndTrends() {
  const anomalies = detectOperationalAnomalies({ deploymentId: DEPLOYMENT_ID });
  assert(anomalies.length >= 5, "anomaly checks");
  const detected = anomalies.filter((a) => a.detected);
  assert(detected.length === 0, "healthy path no false anomalies");
  const trends = analyzeOperationalTrends({ deploymentId: DEPLOYMENT_ID });
  assert(trends.length >= 4, "trends");
  console.log("✓ anomalies & trends");
}

function testBottlenecksInsightsRecommendations() {
  const bottlenecks = identifyOperationalBottlenecks({ deploymentId: DEPLOYMENT_ID });
  const insights = deriveOperationalInsights({ deploymentId: DEPLOYMENT_ID });
  const recommendations = generateOperationalRecommendations({ deploymentId: DEPLOYMENT_ID });
  assert(insights.length >= 2, "insights");
  assert(recommendations.length >= 1, "recommendations");
  for (const ins of insights) {
    assert(ins.insightId.length > 0, "insight id");
    assert(ins.traceId.length > 0, "insight trace");
    assert(ins.evidence.length > 0, "insight evidence");
  }
  for (const rec of recommendations) {
    assert(rec.recommendationId.length > 0, "rec id");
    assert(rec.expectedOutcome.length > 0, "expected outcome");
  }
  console.log("✓ bottlenecks, insights, recommendations");
  console.log(" ", summarizeOperationalBottlenecks(bottlenecks));
  console.log(" ", summarizeOperationalInsights(insights));
  console.log(" ", summarizeOperationalRecommendations(recommendations));
}

function testDecisionAndRuntime() {
  const decision = buildOperationalDecisionSupport({ deploymentId: DEPLOYMENT_ID });
  assert(decision.decisionSupportId.length > 0, "decision id");
  assert(decision.recommendedAction.length > 0, "recommended action");
  assert(["proceed", "monitor", "investigate", "mitigate", "escalate", "hold"].includes(decision.status), "status");
  console.log("✓ decision support");
  console.log(" ", summarizeOperationalDecisionSupport(decision));

  const runtime = buildV4OperationalIntelligenceRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(runtime.version === V4A2_INTELLIGENCE_VERSION, "version");
  assert(runtime.summary.phase === "full", "full phase");
  assert(runtime.health !== null, "health");
  assert(runtime.signals.signals.length === 10, "runtime signals");
  assert(runtime.insights.length >= 2, "runtime insights");
  assert(runtime.recommendations.length >= 1, "runtime recommendations");
  assert(runtime.decisionSupport !== null, "decision support");
  assert(runtime.summary.intelligenceScore >= 80, "summary score");
  assert(runtime.summary.explainable && runtime.summary.replayable, "explainable");

  const summary = summarizeOperationalIntelligenceRuntime(runtime);
  assert(summary.phase === "full", "summary phase");
  console.log("✓ full intelligence runtime");
  console.log(" ", runtime.runtimeSummary);
  console.log(" ", summary.summary);
}

function main() {
  warmOperationalIntelligenceContext(DEPLOYMENT_ID);
  testSignalsAndHealth();
  testAnomaliesAndTrends();
  testBottlenecksInsightsRecommendations();
  testDecisionAndRuntime();
  console.log("\nAll operational intelligence checks passed.");
}

main();
