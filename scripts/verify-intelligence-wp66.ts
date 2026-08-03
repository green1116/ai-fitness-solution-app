/**
 * WP-66 — Decision Engine verification.
 * Deterministic DecisionItem[] from ApprovalItems.
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
  DECISION_ENGINE_CAPABILITY,
  FEAT_67_ID,
  getDecision,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp66.example`,
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
    notes: "wp66 seed",
  });
}

function main() {
  console.log("=== WP-66 / Decision Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp66-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp66-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp66-1",
    customerId: "cust-wp66-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp66-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp66-1",
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

  const first = buildDecision({ approvals });
  assert(FEAT_67_ID === "FEAT-67", "FEAT-67");
  assert(DECISION_ENGINE_CAPABILITY === "DecisionEngine", "DecisionEngine");
  assert(first.length === approvals.length, "count");
  assert(
    first.every((d) => d.id && d.approvalId && d.outcome && d.position >= 1),
    "shape",
  );
  assert(
    first.every((d) => d.id === `decision-${d.approvalId}`),
    "stable id mapping",
  );
  assert(
    first.every((d, i) => d.position === i + 1),
    "1-based contiguous positions",
  );

  for (const a of approvals) {
    const decision = first.find((d) => d.approvalId === a.id);
    assert(decision !== undefined, `decision for ${a.id}`);
    if (a.status === "APPROVED") assert(decision!.outcome === "ACCEPT", "APPROVED->ACCEPT");
    if (a.status === "PENDING") assert(decision!.outcome === "HOLD", "PENDING->HOLD");
    if (a.status === "REJECTED") assert(decision!.outcome === "REJECT", "REJECTED->REJECT");
  }
  console.log("PASS Build");

  const rank = { ACCEPT: 0, HOLD: 1, REJECT: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.outcome];
    const curr = rank[first[i]!.outcome];
    assert(prev <= curr, `outcome order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.approvalId.localeCompare(first[i]!.approvalId) <= 0,
        `stable approvalId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildDecision({ approvals });
  assert(
    second.map((d) => `${d.id}:${d.outcome}:${d.position}`).join("|") ===
      first.map((d) => `${d.id}:${d.outcome}:${d.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildDecision();
  assert(viaDefault.length === first.length, "default path");
  const got = getDecision();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-66 Decision Engine");
  console.log("WP-66 verification complete");
}

main();
