/**
 * WP-68 — Archive Engine verification.
 * Deterministic ArchiveItem[] from ExecutionItems.
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
  ARCHIVE_ENGINE_CAPABILITY,
  buildApproval,
  buildArchive,
  buildAssignment,
  buildAttention,
  buildBatch,
  buildDecision,
  buildDispatch,
  buildExecution,
  buildInsights,
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildPlan,
  buildPriorityItems,
  buildQueue,
  buildRecommendations,
  buildReview,
  buildRoute,
  buildSignals,
  buildTask,
  clearApproval,
  clearArchive,
  clearAssignment,
  clearAttention,
  clearBatch,
  clearDecision,
  clearDispatch,
  clearExecution,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearPlan,
  clearPriorityItems,
  clearQueue,
  clearRecommendations,
  clearReview,
  clearRoute,
  clearSignals,
  clearTask,
  createIntelligenceSnapshot,
  FEAT_69_ID,
  getArchive,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearArchive();
  clearExecution();
  clearDecision();
  clearApproval();
  clearReview();
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
    email: `${input.customerId}@wp68.example`,
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
    notes: "wp68 seed",
  });
}

function main() {
  console.log("=== WP-68 / Archive Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp68-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp68-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp68-1",
    customerId: "cust-wp68-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp68-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp68-1",
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
  const plans = buildPlan({ tasks });
  const reviews = buildReview({ plans });
  const approvals = buildApproval({ reviews });
  const decisions = buildDecision({ approvals });
  const executions = buildExecution({ decisions });

  const first = buildArchive({ executions });
  assert(FEAT_69_ID === "FEAT-69", "FEAT-69");
  assert(ARCHIVE_ENGINE_CAPABILITY === "ArchiveEngine", "ArchiveEngine");
  assert(first.length === executions.length, "count");
  assert(
    first.every((a) => a.id && a.executionId && a.status && a.position >= 1),
    "shape",
  );
  assert(
    first.every((a) => a.id === `archive-${a.executionId}`),
    "stable id mapping",
  );
  assert(
    first.every((a, i) => a.position === i + 1),
    "1-based contiguous positions",
  );

  for (const e of executions) {
    const archive = first.find((a) => a.executionId === e.id);
    assert(archive !== undefined, `archive for ${e.id}`);
    if (e.action === "RUN") assert(archive!.status === "ARCHIVED", "RUN->ARCHIVED");
    if (e.action === "DEFER") assert(archive!.status === "PENDING", "DEFER->PENDING");
    if (e.action === "SKIP") assert(archive!.status === "SKIPPED", "SKIP->SKIPPED");
  }
  console.log("PASS Build");

  const rank = { ARCHIVED: 0, PENDING: 1, SKIPPED: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.status];
    const curr = rank[first[i]!.status];
    assert(prev <= curr, `status order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.executionId.localeCompare(first[i]!.executionId) <= 0,
        `stable executionId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildArchive({ executions });
  assert(
    second.map((a) => `${a.id}:${a.status}:${a.position}`).join("|") ===
      first.map((a) => `${a.id}:${a.status}:${a.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildArchive();
  assert(viaDefault.length === first.length, "default path");
  const got = getArchive();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-68 Archive Engine");
  console.log("WP-68 verification complete");
}

main();
