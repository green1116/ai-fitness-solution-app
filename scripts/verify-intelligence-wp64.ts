/**
 * WP-64 — Review Engine verification.
 * Deterministic ReviewItem[] from PlanItems.
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
  buildReview,
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
  clearReview,
  clearRoute,
  clearSignals,
  clearTask,
  createIntelligenceSnapshot,
  FEAT_65_ID,
  getReview,
  REVIEW_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp64.example`,
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
    notes: "wp64 seed",
  });
}

function main() {
  console.log("=== WP-64 / Review Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp64-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp64-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp64-1",
    customerId: "cust-wp64-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp64-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp64-1",
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

  const first = buildReview({ plans });
  assert(FEAT_65_ID === "FEAT-65", "FEAT-65");
  assert(REVIEW_ENGINE_CAPABILITY === "ReviewEngine", "ReviewEngine");
  assert(first.length === plans.length, "count");
  assert(
    first.every((r) => r.id && r.planId && r.status && r.position >= 1),
    "shape",
  );
  assert(
    first.every((r) => r.id === `review-${r.planId}`),
    "stable id mapping",
  );
  assert(
    first.every((r, i) => r.position === i + 1),
    "1-based contiguous positions",
  );

  for (const p of plans) {
    const review = first.find((r) => r.planId === p.id);
    assert(review !== undefined, `review for ${p.id}`);
    if (p.stage === "START") assert(review!.status === "PASS", "START->PASS");
    if (p.stage === "MIDDLE") assert(review!.status === "WARN", "MIDDLE->WARN");
    if (p.stage === "END") assert(review!.status === "BLOCK", "END->BLOCK");
  }
  console.log("PASS Build");

  const rank = { PASS: 0, WARN: 1, BLOCK: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[first[i - 1]!.status];
    const curr = rank[first[i]!.status];
    assert(prev <= curr, `status order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.planId.localeCompare(first[i]!.planId) <= 0,
        `stable planId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildReview({ plans });
  assert(
    second.map((r) => `${r.id}:${r.status}:${r.position}`).join("|") ===
      first.map((r) => `${r.id}:${r.status}:${r.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildReview();
  assert(viaDefault.length === first.length, "default path");
  const got = getReview();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-64 Review Engine");
  console.log("WP-64 verification complete");
}

main();
