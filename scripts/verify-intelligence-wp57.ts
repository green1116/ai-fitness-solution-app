/**
 * WP-57 — Queue Engine verification.
 * Deterministic QueueItem[] from AttentionItems.
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
  buildAttention,
  buildInsights,
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildPriorityItems,
  buildQueue,
  buildRecommendations,
  buildSignals,
  clearAttention,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearPriorityItems,
  clearQueue,
  clearRecommendations,
  clearSignals,
  createIntelligenceSnapshot,
  FEAT_58_ID,
  getQueue,
  QUEUE_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearQueue();
  clearAttention();
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
    email: `${input.customerId}@wp57.example`,
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
    notes: "wp57 seed",
  });
}

function main() {
  console.log("=== WP-57 / Queue Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp57-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp57-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp57-1",
    customerId: "cust-wp57-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp57-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp57-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();
  const insights = buildInsights({ recommendations });
  const priorityItems = buildPriorityItems({ insights, recommendations });
  const signals = buildSignals({ insights, recommendations, priorityItems });
  const attention = buildAttention({ signals });

  const first = buildQueue({ attention });
  assert(FEAT_58_ID === "FEAT-58", "FEAT-58");
  assert(QUEUE_ENGINE_CAPABILITY === "QueueEngine", "QueueEngine");
  assert(first.length === attention.length, "count");
  assert(
    first.every((q) => q.id && q.attentionId && q.position >= 1),
    "shape",
  );
  assert(
    first.every((q) => q.id === `queue-${q.attentionId}`),
    "stable id mapping",
  );
  assert(
    first.every((q, i) => q.position === i + 1),
    "1-based contiguous positions",
  );
  console.log("PASS Build");

  const levelByAtt = new Map(attention.map((a) => [a.id, a.level]));
  const rank = { CRITICAL: 0, HIGH: 1, NORMAL: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[levelByAtt.get(first[i - 1]!.attentionId)!]!;
    const curr = rank[levelByAtt.get(first[i]!.attentionId)!]!;
    assert(prev <= curr, `level order at position ${first[i]!.position}`);
  }
  console.log("PASS Ordering");

  const second = buildQueue({ attention });
  assert(
    second.map((q) => `${q.id}:${q.position}`).join("|") ===
      first.map((q) => `${q.id}:${q.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildQueue();
  assert(viaDefault.length === first.length, "default path count");
  const got = getQueue();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  assert(got[0]?.position === 1, "get first position");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-57 Queue Engine");
  console.log("WP-57 verification complete");
}

main();
