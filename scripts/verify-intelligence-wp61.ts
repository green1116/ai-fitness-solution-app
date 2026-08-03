/**
 * WP-61 — Assignment Engine verification.
 * Deterministic AssignmentItem[] from RouteItems.
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
  ASSIGNMENT_ENGINE_CAPABILITY,
  buildAssignment,
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
  clearAssignment,
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
  FEAT_62_ID,
  getAssignment,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearAssignment();
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
    email: `${input.customerId}@wp61.example`,
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
    notes: "wp61 seed",
  });
}

function main() {
  console.log("=== WP-61 / Assignment Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp61-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp61-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp61-1",
    customerId: "cust-wp61-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp61-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp61-1",
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
  const routes = buildRoute({ dispatches });

  const first = buildAssignment({ routes });
  assert(FEAT_62_ID === "FEAT-62", "FEAT-62");
  assert(
    ASSIGNMENT_ENGINE_CAPABILITY === "AssignmentEngine",
    "AssignmentEngine",
  );
  assert(first.length === routes.length, "count");
  assert(
    first.every((a) => a.id && a.routeId && a.assignee && a.position >= 1),
    "shape",
  );
  assert(
    first.every((a) => a.id === `assign-${a.routeId}`),
    "stable id mapping",
  );
  assert(
    first.every((a, i) => a.position === i + 1),
    "1-based contiguous positions",
  );

  for (const r of routes) {
    const assign = first.find((a) => a.routeId === r.id);
    assert(assign !== undefined, `assignment for ${r.id}`);
    if (r.target === "INTERNAL") assert(assign!.assignee === "CORE", "INTERNAL->CORE");
    if (r.target === "EXTERNAL") assert(assign!.assignee === "OPS", "EXTERNAL->OPS");
    if (r.target === "ARCHIVE") assert(assign!.assignee === "ARCHIVE", "ARCHIVE->ARCHIVE");
  }
  console.log("PASS Build");

  const rank = { CORE: 0, OPS: 1, ARCHIVE: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.assignee];
    const curr = rank[first[i]!.assignee];
    assert(prev <= curr, `assignee order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.routeId.localeCompare(first[i]!.routeId) <= 0,
        `stable routeId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildAssignment({ routes });
  assert(
    second.map((a) => `${a.id}:${a.assignee}:${a.position}`).join("|") ===
      first.map((a) => `${a.id}:${a.assignee}:${a.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildAssignment();
  assert(viaDefault.length === first.length, "default path");
  const got = getAssignment();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-61 Assignment Engine");
  console.log("WP-61 verification complete");
}

main();
