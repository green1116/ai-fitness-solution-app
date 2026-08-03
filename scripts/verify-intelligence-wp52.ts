/**
 * WP-52 — Recommendation Engine verification.
 * Deterministic recommendations from IP-1 Context/Metrics/Snapshot/Automation.
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
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildRecommendations,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearRecommendations,
  createIntelligenceSnapshot,
  FEAT_53_ID,
  getRecommendations,
  RECOMMENDATION_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp52.example`,
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
    type: "CALL",
    notes: "wp52 seed",
  });
}

function main() {
  console.log("=== WP-52 / Recommendation Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp52-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp52-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp52-1",
    customerId: "cust-wp52-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp52-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });
  // open renewal remains OPEN → retention MEDIUM path

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp52-1",
    version: "v1",
  });
  buildIntelligenceMetrics();

  const first = buildRecommendations();
  assert(FEAT_53_ID === "FEAT-53", "FEAT-53");
  assert(
    RECOMMENDATION_ENGINE_CAPABILITY === "RecommendationEngine",
    "RecommendationEngine",
  );
  assert(first.length >= 3, "has recommendations");
  assert(
    first.every((r) => r.id && r.type && r.priority && r.title && r.reason),
    "shape",
  );
  assert(
    first.some((r) => r.id === "rec-health-at-risk"),
    "at-risk rec",
  );
  assert(
    first.some((r) => r.id === "rec-support-open-cases"),
    "support rec",
  );
  assert(
    first.some((r) => r.id === "rec-automation-setup"),
    "automation setup",
  );
  assert(
    first.some((r) => r.id === "rec-retention-action"),
    "retention rec",
  );

  // Deterministic: same inputs → same ordered ids
  const second = buildRecommendations();
  assert(
    second.map((r) => r.id).join("|") === first.map((r) => r.id).join("|"),
    "deterministic ids",
  );
  assert(
    second.map((r) => r.reason).join("|") ===
      first.map((r) => r.reason).join("|"),
    "deterministic reasons",
  );

  const got = getRecommendations();
  assert(got.length === first.length, "get length");
  assert(got[0]?.id === first[0]?.id, "get first id");
  console.log("PASS Build");
  console.log("PASS Deterministic");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-52 Recommendation Engine");
  console.log("WP-52 verification complete");
}

main();
