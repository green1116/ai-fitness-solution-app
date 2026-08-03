/**
 * WP-63 — Plan Engine verification.
 * Deterministic PlanItem[] from TaskItems.
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
  buildAssignment,
  buildAttention,
  buildBatch,
  buildDispatch,
  buildInsights,
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildPlan,
  buildPriorityItems,
  buildQueue,
  buildRecommendations,
  buildRoute,
  buildSignals,
  buildTask,
  clearAssignment,
  clearAttention,
  clearBatch,
  clearDispatch,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearPlan,
  clearPriorityItems,
  clearQueue,
  clearRecommendations,
  clearRoute,
  clearSignals,
  clearTask,
  createIntelligenceSnapshot,
  FEAT_64_ID,
  getPlan,
  PLAN_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearPlan();
  clearTask();
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
    email: `${input.customerId}@wp63.example`,
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
    notes: "wp63 seed",
  });
}

function main() {
  console.log("=== WP-63 / Plan Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp63-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp63-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp63-1",
    customerId: "cust-wp63-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp63-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp63-1",
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
  const assignments = buildAssignment({ routes });
  const tasks = buildTask({ assignments });

  const first = buildPlan({ tasks });
  assert(FEAT_64_ID === "FEAT-64", "FEAT-64");
  assert(PLAN_ENGINE_CAPABILITY === "PlanEngine", "PlanEngine");
  assert(first.length === tasks.length, "count");
  assert(
    first.every((p) => p.id && p.taskId && p.stage && p.position >= 1),
    "shape",
  );
  assert(
    first.every((p) => p.id === `plan-${p.taskId}`),
    "stable id mapping",
  );
  assert(
    first.every((p, i) => p.position === i + 1),
    "1-based contiguous positions",
  );

  for (const t of tasks) {
    const plan = first.find((p) => p.taskId === t.id);
    assert(plan !== undefined, `plan for ${t.id}`);
    if (t.status === "READY") assert(plan!.stage === "START", "READY->START");
    if (t.status === "WAITING") assert(plan!.stage === "MIDDLE", "WAITING->MIDDLE");
    if (t.status === "DONE") assert(plan!.stage === "END", "DONE->END");
  }
  console.log("PASS Build");

  const rank = { START: 0, MIDDLE: 1, END: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.stage];
    const curr = rank[first[i]!.stage];
    assert(prev <= curr, `stage order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.taskId.localeCompare(first[i]!.taskId) <= 0,
        `stable taskId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildPlan({ tasks });
  assert(
    second.map((p) => `${p.id}:${p.stage}:${p.position}`).join("|") ===
      first.map((p) => `${p.id}:${p.stage}:${p.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildPlan();
  assert(viaDefault.length === first.length, "default path");
  const got = getPlan();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-63 Plan Engine");
  console.log("WP-63 verification complete");
}

main();
