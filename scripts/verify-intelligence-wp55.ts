/**
 * WP-55 — Signal Engine verification.
 * Deterministic Signal[] from Insights + Recommendations + PriorityItems.
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
  buildSignals,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearPriorityItems,
  clearRecommendations,
  clearSignals,
  createIntelligenceSnapshot,
  FEAT_56_ID,
  getSignals,
  SIGNAL_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearSignals();
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
    email: `${input.customerId}@wp55.example`,
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
    type: "MEETING",
    notes: "wp55 seed",
  });
}

function main() {
  console.log("=== WP-55 / Signal Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp55-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp55-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp55-1",
    customerId: "cust-wp55-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp55-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp55-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();
  const insights = buildInsights({ recommendations });
  const priorityItems = buildPriorityItems({ insights, recommendations });

  const first = buildSignals({ insights, recommendations, priorityItems });
  assert(FEAT_56_ID === "FEAT-56", "FEAT-56");
  assert(SIGNAL_ENGINE_CAPABILITY === "SignalEngine", "SignalEngine");
  assert(
    first.length ===
      insights.length + recommendations.length + priorityItems.length,
    "count",
  );
  assert(
    first.every(
      (s) =>
        s.id &&
        s.sourceType &&
        s.signalType &&
        s.intensity &&
        s.title &&
        s.reason,
    ),
    "shape",
  );
  assert(
    first.some((s) => s.id === "sig-insight-ins-health-pressure"),
    "insight signal",
  );
  assert(
    first.some((s) => s.id === "sig-rec-rec-health-at-risk"),
    "recommendation signal",
  );
  assert(
    first.some((s) => s.id.startsWith("sig-pri-pri-")),
    "priority signal",
  );

  const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    assert(
      rank[first[i - 1]!.intensity] <= rank[first[i]!.intensity],
      `intensity order at ${i}`,
    );
  }

  const second = buildSignals({ insights, recommendations, priorityItems });
  assert(
    second.map((s) => s.id).join("|") === first.map((s) => s.id).join("|"),
    "deterministic ids",
  );
  assert(
    second.map((s) => s.reason).join("|") ===
      first.map((s) => s.reason).join("|"),
    "deterministic reasons",
  );

  const viaDefault = buildSignals();
  assert(viaDefault.length === first.length, "default path count");

  const got = getSignals();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Build");
  console.log("PASS Ordering");
  console.log("PASS Deterministic");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-55 Signal Engine");
  console.log("WP-55 verification complete");
}

main();
