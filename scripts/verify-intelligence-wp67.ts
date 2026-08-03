/**
 * WP-67 — Execution Engine verification.
 * Deterministic ExecutionItem[] from DecisionItems.
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
  buildApproval,
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
  EXECUTION_ENGINE_CAPABILITY,
  FEAT_68_ID,
  getExecution,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp67.example`,
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
    notes: "wp67 seed",
  });
}

function main() {
  console.log("=== WP-67 / Execution Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp67-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp67-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp67-1",
    customerId: "cust-wp67-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp67-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp67-1",
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

  const first = buildExecution({ decisions });
  assert(FEAT_68_ID === "FEAT-68", "FEAT-68");
  assert(EXECUTION_ENGINE_CAPABILITY === "ExecutionEngine", "ExecutionEngine");
  assert(first.length === decisions.length, "count");
  assert(
    first.every((e) => e.id && e.decisionId && e.action && e.position >= 1),
    "shape",
  );
  assert(
    first.every((e) => e.id === `execution-${e.decisionId}`),
    "stable id mapping",
  );
  assert(
    first.every((e, i) => e.position === i + 1),
    "1-based contiguous positions",
  );

  for (const d of decisions) {
    const execution = first.find((e) => e.decisionId === d.id);
    assert(execution !== undefined, `execution for ${d.id}`);
    if (d.outcome === "ACCEPT") assert(execution!.action === "RUN", "ACCEPT->RUN");
    if (d.outcome === "REJECT") assert(execution!.action === "SKIP", "REJECT->SKIP");
    if (d.outcome === "HOLD") assert(execution!.action === "DEFER", "HOLD->DEFER");
  }
  console.log("PASS Build");

  const rank = { RUN: 0, SKIP: 1, DEFER: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.action];
    const curr = rank[first[i]!.action];
    assert(prev <= curr, `action order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.decisionId.localeCompare(first[i]!.decisionId) <= 0,
        `stable decisionId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildExecution({ decisions });
  assert(
    second.map((e) => `${e.id}:${e.action}:${e.position}`).join("|") ===
      first.map((e) => `${e.id}:${e.action}:${e.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildExecution();
  assert(viaDefault.length === first.length, "default path");
  const got = getExecution();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-67 Execution Engine");
  console.log("WP-67 verification complete");
}

main();
