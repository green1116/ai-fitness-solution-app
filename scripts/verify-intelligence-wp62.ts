/**
 * WP-62 — Task Engine verification.
 * Deterministic TaskItem[] from AssignmentItems.
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
  clearPriorityItems,
  clearQueue,
  clearRecommendations,
  clearRoute,
  clearSignals,
  clearTask,
  createIntelligenceSnapshot,
  FEAT_63_ID,
  getTask,
  TASK_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp62.example`,
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
    notes: "wp62 seed",
  });
}

function main() {
  console.log("=== WP-62 / Task Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp62-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp62-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp62-1",
    customerId: "cust-wp62-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp62-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp62-1",
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

  const first = buildTask({ assignments });
  assert(FEAT_63_ID === "FEAT-63", "FEAT-63");
  assert(TASK_ENGINE_CAPABILITY === "TaskEngine", "TaskEngine");
  assert(first.length === assignments.length, "count");
  assert(
    first.every((t) => t.id && t.assignmentId && t.status && t.position >= 1),
    "shape",
  );
  assert(
    first.every((t) => t.id === `task-${t.assignmentId}`),
    "stable id mapping",
  );
  assert(
    first.every((t, i) => t.position === i + 1),
    "1-based contiguous positions",
  );

  for (const a of assignments) {
    const task = first.find((t) => t.assignmentId === a.id);
    assert(task !== undefined, `task for ${a.id}`);
    if (a.assignee === "CORE") assert(task!.status === "READY", "CORE->READY");
    if (a.assignee === "OPS") assert(task!.status === "WAITING", "OPS->WAITING");
    if (a.assignee === "ARCHIVE") assert(task!.status === "DONE", "ARCHIVE->DONE");
  }
  console.log("PASS Build");

  const rank = { READY: 0, WAITING: 1, DONE: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.status];
    const curr = rank[first[i]!.status];
    assert(prev <= curr, `status order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.assignmentId.localeCompare(first[i]!.assignmentId) <= 0,
        `stable assignmentId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildTask({ assignments });
  assert(
    second.map((t) => `${t.id}:${t.status}:${t.position}`).join("|") ===
      first.map((t) => `${t.id}:${t.status}:${t.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildTask();
  assert(viaDefault.length === first.length, "default path");
  const got = getTask();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-62 Task Engine");
  console.log("WP-62 verification complete");
}

main();
