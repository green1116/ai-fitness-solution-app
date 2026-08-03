/**
 * WP-60 — Route Engine verification.
 * Deterministic RouteItem[] from DispatchItems.
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
  buildRoute,
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
  clearRoute,
  clearSignals,
  createIntelligenceSnapshot,
  FEAT_61_ID,
  getRoute,
  ROUTE_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearRoute();
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
    email: `${input.customerId}@wp60.example`,
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
    notes: "wp60 seed",
  });
}

function main() {
  console.log("=== WP-60 / Route Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp60-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp60-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp60-1",
    customerId: "cust-wp60-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp60-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp60-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();
  const insights = buildInsights({ recommendations });
  const priorityItems = buildPriorityItems({ insights, recommendations });
  const signals = buildSignals({ insights, recommendations, priorityItems });
  const attention = buildAttention({ signals });
  const queue = buildQueue({ attention });
  const batches = buildBatch({ queue, batchSize: 2 });
  const dispatches = buildDispatch({ batches });

  const first = buildRoute({ dispatches });
  assert(FEAT_61_ID === "FEAT-61", "FEAT-61");
  assert(ROUTE_ENGINE_CAPABILITY === "RouteEngine", "RouteEngine");
  assert(first.length === dispatches.length, "count");
  assert(
    first.every((r) => r.id && r.dispatchId && r.target && r.position >= 1),
    "shape",
  );
  assert(
    first.every((r) => r.id === `route-${r.dispatchId}`),
    "stable id mapping",
  );
  assert(
    first.every((r, i) => r.position === i + 1),
    "1-based contiguous positions",
  );

  for (const d of dispatches) {
    const route = first.find((r) => r.dispatchId === d.id);
    assert(route !== undefined, `route for ${d.id}`);
    if (d.priority === "CRITICAL") assert(route!.target === "INTERNAL", "CRITICAL->INTERNAL");
    if (d.priority === "HIGH") assert(route!.target === "EXTERNAL", "HIGH->EXTERNAL");
    if (d.priority === "NORMAL") assert(route!.target === "ARCHIVE", "NORMAL->ARCHIVE");
  }
  console.log("PASS Build");

  const rank = { INTERNAL: 0, EXTERNAL: 1, ARCHIVE: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.target];
    const curr = rank[first[i]!.target];
    assert(prev <= curr, `target order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.dispatchId.localeCompare(first[i]!.dispatchId) <= 0,
        `stable dispatch id at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildRoute({ dispatches });
  assert(
    second.map((r) => `${r.id}:${r.target}:${r.position}`).join("|") ===
      first.map((r) => `${r.id}:${r.target}:${r.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildRoute();
  assert(viaDefault.length === first.length, "default path");
  const got = getRoute();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-60 Route Engine");
  console.log("WP-60 verification complete");
}

main();
