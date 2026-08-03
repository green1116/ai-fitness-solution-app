/**
 * WP-54 — Priority Engine verification.
 * Deterministic PriorityItem[] from Insights + Recommendations.
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
  buildPriorityItems,
  buildRecommendations,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearPriorityItems,
  clearRecommendations,
  createIntelligenceSnapshot,
  FEAT_55_ID,
  getPriorityItems,
  PRIORITY_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearPriorityItems();
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
    email: `${input.customerId}@wp54.example`,
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
    notes: "wp54 seed",
  });
}

function main() {
  console.log("=== WP-54 / Priority Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp54-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp54-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp54-1",
    customerId: "cust-wp54-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp54-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp54-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();
  const insights = buildInsights({ recommendations });

  const first = buildPriorityItems({ insights, recommendations });
  assert(FEAT_55_ID === "FEAT-55", "FEAT-55");
  assert(PRIORITY_ENGINE_CAPABILITY === "PriorityEngine", "PriorityEngine");
  assert(first.length === insights.length + recommendations.length, "count");
  assert(
    first.every(
      (p) => p.id && p.sourceType && p.priority && p.title && p.reason,
    ),
    "shape",
  );
  assert(
    first.some((p) => p.id === "pri-insight-ins-health-pressure"),
    "insight item",
  );
  assert(
    first.some((p) => p.id === "pri-rec-rec-health-at-risk"),
    "recommendation item",
  );

  // Stable ordering: HIGH before MEDIUM before LOW
  const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    assert(
      rank[first[i - 1]!.priority] <= rank[first[i]!.priority],
      `order at ${i}`,
    );
  }

  // Within same priority, INSIGHT before RECOMMENDATION
  const high = first.filter((p) => p.priority === "HIGH");
  if (high.length >= 2) {
    const insightIdx = high.findIndex((p) => p.sourceType === "INSIGHT");
    const recIdx = high.findIndex((p) => p.sourceType === "RECOMMENDATION");
    if (insightIdx >= 0 && recIdx >= 0) {
      assert(insightIdx < recIdx, "insight before recommendation in HIGH");
    }
  }

  const second = buildPriorityItems({ insights, recommendations });
  assert(
    second.map((p) => p.id).join("|") === first.map((p) => p.id).join("|"),
    "deterministic ids",
  );
  assert(
    second.map((p) => p.reason).join("|") ===
      first.map((p) => p.reason).join("|"),
    "deterministic reasons",
  );

  const viaDefault = buildPriorityItems();
  assert(viaDefault.length === first.length, "default path count");

  const got = getPriorityItems();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Build");
  console.log("PASS Ordering");
  console.log("PASS Deterministic");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-54 Priority Engine");
  console.log("WP-54 verification complete");
}

main();
