/**
 * WP-65 — Approval Engine verification.
 * Deterministic ApprovalItem[] from ReviewItems.
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
  APPROVAL_ENGINE_CAPABILITY,
  FEAT_66_ID,
  getApproval,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp65.example`,
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
    notes: "wp65 seed",
  });
}

function main() {
  console.log("=== WP-65 / Approval Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp65-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp65-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp65-1",
    customerId: "cust-wp65-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp65-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp65-1",
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

  const first = buildApproval({ reviews });
  assert(FEAT_66_ID === "FEAT-66", "FEAT-66");
  assert(APPROVAL_ENGINE_CAPABILITY === "ApprovalEngine", "ApprovalEngine");
  assert(first.length === reviews.length, "count");
  assert(
    first.every((a) => a.id && a.reviewId && a.status && a.position >= 1),
    "shape",
  );
  assert(
    first.every((a) => a.id === `approval-${a.reviewId}`),
    "stable id mapping",
  );
  assert(
    first.every((a, i) => a.position === i + 1),
    "1-based contiguous positions",
  );

  for (const r of reviews) {
    const approval = first.find((a) => a.reviewId === r.id);
    assert(approval !== undefined, `approval for ${r.id}`);
    if (r.status === "PASS") assert(approval!.status === "APPROVED", "PASS->APPROVED");
    if (r.status === "WARN") assert(approval!.status === "PENDING", "WARN->PENDING");
    if (r.status === "BLOCK") assert(approval!.status === "REJECTED", "BLOCK->REJECTED");
  }
  console.log("PASS Build");

  const rank = { APPROVED: 0, PENDING: 1, REJECTED: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.status];
    const curr = rank[first[i]!.status];
    assert(prev <= curr, `status order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.reviewId.localeCompare(first[i]!.reviewId) <= 0,
        `stable reviewId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildApproval({ reviews });
  assert(
    second.map((a) => `${a.id}:${a.status}:${a.position}`).join("|") ===
      first.map((a) => `${a.id}:${a.status}:${a.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildApproval();
  assert(viaDefault.length === first.length, "default path");
  const got = getApproval();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-65 Approval Engine");
  console.log("WP-65 verification complete");
}

main();
