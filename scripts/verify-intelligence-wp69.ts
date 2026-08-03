/**
 * WP-69 — Report Engine verification.
 * Deterministic ReportItem[] from ArchiveItems.
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
  buildReport,
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
  clearReport,
  clearReview,
  clearRoute,
  clearSignals,
  clearTask,
  createIntelligenceSnapshot,
  FEAT_70_ID,
  getReport,
  REPORT_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearReport();
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
    email: `${input.customerId}@wp69.example`,
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
    notes: "wp69 seed",
  });
}

function main() {
  console.log("=== WP-69 / Report Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp69-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp69-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp69-1",
    customerId: "cust-wp69-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp69-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp69-1",
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
  const archives = buildArchive({ executions });

  const first = buildReport({ archives });
  assert(FEAT_70_ID === "FEAT-70", "FEAT-70");
  assert(REPORT_ENGINE_CAPABILITY === "ReportEngine", "ReportEngine");
  assert(first.length === archives.length, "count");
  assert(
    first.every((r) => r.id && r.archiveId && r.summary && r.position >= 1),
    "shape",
  );
  assert(
    first.every((r) => r.id === `report-${r.archiveId}`),
    "stable id mapping",
  );
  assert(
    first.every((r, i) => r.position === i + 1),
    "1-based contiguous positions",
  );
  assert(
    first.every((r) => r.summary.includes(`archive=${r.archiveId}`)),
    "summary includes archive id",
  );
  console.log("PASS Build");

  const statusByArchive = new Map(archives.map((a) => [a.id, a.status]));
  const rank = { ARCHIVED: 0, PENDING: 1, SKIPPED: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    const prev = rank[statusByArchive.get(first[i - 1]!.archiveId)!]!;
    const curr = rank[statusByArchive.get(first[i]!.archiveId)!]!;
    assert(prev <= curr, `status order at ${i}`);
    if (prev === curr) {
      assert(
        first[i - 1]!.archiveId.localeCompare(first[i]!.archiveId) <= 0,
        `stable archiveId at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  const second = buildReport({ archives });
  assert(
    second.map((r) => `${r.id}:${r.summary}:${r.position}`).join("|") ===
      first.map((r) => `${r.id}:${r.summary}:${r.position}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildReport();
  assert(viaDefault.length === first.length, "default path");
  const got = getReport();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-69 Report Engine");
  console.log("WP-69 verification complete");
}

main();
