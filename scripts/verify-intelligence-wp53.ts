/**
 * WP-53 — Insight Engine verification.
 * Deterministic insights from IP-1 + optional Recommendations.
 */
import {
  addRenewal,
  clearAutomationDashboard,
  clearCustomerAnalytics,
  clearCustomerAutomations,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerInsights,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearExpansionInsights,
  clearExpansions,
  clearOptimizationDashboard,
  clearRenewals,
  clearRetentionDashboard,
  clearRetentionInsights,
  clearSupportCases,
  clearTasks,
  clearWorkflows,
  createCustomerProfile,
  openSupportCase,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
} from "../lib/post-launch";
import {
  buildInsights,
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildRecommendations,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearRecommendations,
  createIntelligenceSnapshot,
  FEAT_54_ID,
  getInsights,
  INSIGHT_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearInsights();
  clearRecommendations();
  clearIntelligenceDashboard();
  clearIntelligenceMetrics();
  clearIntelligenceSnapshots();
  clearIntelligenceContext();
  clearAutomationDashboard();
  clearTasks();
  clearWorkflows();
  clearCustomerAutomations();
  clearOptimizationDashboard();
  clearExpansionInsights();
  clearRetentionInsights();
  clearCustomerInsights();
  clearRetentionDashboard();
  clearExpansions();
  clearRenewals();
  clearCustomerAnalytics();
  clearCustomerSuccessDashboard();
  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
}

function seedCustomer(input: {
  customerId: string;
  name: string;
  stage: "ACTIVE" | "RISK";
  health: "GOOD" | "WARNING";
  score: number;
}) {
  registerCustomer({
    customerId: input.customerId,
    name: input.name,
    organization: `Org ${input.customerId}`,
    email: `${input.customerId}@wp53.example`,
  });
  createCustomerProfile({
    customerId: input.customerId,
    displayName: input.name,
  });
  setCustomerLifecycleStage({
    customerId: input.customerId,
    stage: input.stage,
  });
  setCustomerHealth({
    customerId: input.customerId,
    score: input.score,
    level: input.health,
  });
  recordCustomerEngagement({
    customerId: input.customerId,
    type: "EMAIL",
    notes: "wp53 seed",
  });
}

function main() {
  console.log("=== WP-53 / Insight Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp53-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp53-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp53-1",
    customerId: "cust-wp53-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp53-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp53-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();

  const first = buildInsights({ recommendations });
  assert(FEAT_54_ID === "FEAT-54", "FEAT-54");
  assert(INSIGHT_ENGINE_CAPABILITY === "InsightEngine", "InsightEngine");
  assert(first.length >= 3, "has insights");
  assert(
    first.every((i) => i.id && i.type && i.severity && i.title && i.summary),
    "shape",
  );
  assert(
    first.some((i) => i.id === "ins-health-pressure"),
    "health insight",
  );
  assert(
    first.some((i) => i.id === "ins-retention-gap"),
    "retention insight",
  );
  assert(
    first.some((i) => i.id === "ins-support-load"),
    "support insight",
  );
  assert(
    first.some((i) => i.id === "ins-recommendation-signal"),
    "recommendation signal",
  );
  assert(
    first.some((i) => i.id === "ins-automation-absent"),
    "automation absent",
  );

  const second = buildInsights({ recommendations });
  assert(
    second.map((i) => i.id).join("|") === first.map((i) => i.id).join("|"),
    "deterministic ids",
  );
  assert(
    second.map((i) => i.summary).join("|") ===
      first.map((i) => i.summary).join("|"),
    "deterministic summaries",
  );

  // Optional omitted → uses getRecommendations()
  const viaDefault = buildInsights();
  assert(
    viaDefault.some((i) => i.id === "ins-recommendation-signal"),
    "default recommendations path",
  );

  const got = getInsights();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Build");
  console.log("PASS Deterministic");
  console.log("PASS Optional Recommendations");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-53 Insight Engine");
  console.log("WP-53 verification complete");
}

main();
