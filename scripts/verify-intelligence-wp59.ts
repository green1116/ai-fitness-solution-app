/**
 * WP-59 — Dispatch Engine verification.
 * Deterministic DispatchItem[] from Batches.
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
  buildBatch,
  buildDispatch,
  buildInsights,
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildPriorityItems,
  buildQueue,
  buildRecommendations,
  buildSignals,
  clearAttention,
  clearBatch,
  clearDispatch,
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
  DISPATCH_ENGINE_CAPABILITY,
  FEAT_60_ID,
  getDispatch,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearDispatch();
  clearBatch();
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
    email: `${input.customerId}@wp59.example`,
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
    notes: "wp59 seed",
  });
}

function main() {
  console.log("=== WP-59 / Dispatch Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp59-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp59-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp59-1",
    customerId: "cust-wp59-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp59-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp59-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();
  const insights = buildInsights({ recommendations });
  const priorityItems = buildPriorityItems({ insights, recommendations });
  const signals = buildSignals({ insights, recommendations, priorityItems });
  const attention = buildAttention({ signals });
  const queue = buildQueue({ attention });
  // Force multiple batches with different priority mixes
  const batches = buildBatch({ queue, batchSize: 2 });

  const first = buildDispatch({ batches });
  assert(FEAT_60_ID === "FEAT-60", "FEAT-60");
  assert(DISPATCH_ENGINE_CAPABILITY === "DispatchEngine", "DispatchEngine");
  assert(first.length === batches.length, "count");
  assert(
    first.every(
      (d) => d.id && d.batchId && d.priority && d.position >= 1,
    ),
    "shape",
  );
  assert(
    first.every((d) => d.id === `dispatch-${d.batchId}`),
    "stable id mapping",
  );
  assert(
    first.every((d, i) => d.position === i + 1),
    "1-based contiguous positions",
  );
  console.log("PASS Build");

  const rank = { CRITICAL: 0, HIGH: 1, NORMAL: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.priority];
    const curr = rank[first[i]!.priority];
    assert(prev <= curr, `priority order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.batchId.localeCompare(first[i]!.batchId) <= 0,
        `stable batch id at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildDispatch({ batches });
  assert(
    second.map((d) => `${d.id}:${d.priority}:${d.position}`).join("|") ===
      first.map((d) => `${d.id}:${d.priority}:${d.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildDispatch();
  assert(viaDefault.length >= 1, "default path");
  const got = getDispatch();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-59 Dispatch Engine");
  console.log("WP-59 verification complete");
}

main();
