/**
 * WP-74 — Workspace Filter Engine verification.
 * Read-only filters over Workspace / Workspace View.
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
  buildDashboard,
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
  buildWorkspace,
  buildWorkspaceFilter,
  buildWorkspaceView,
  clearApproval,
  clearArchive,
  clearAssignment,
  clearAttention,
  clearBatch,
  clearDashboard,
  clearDecision,
  clearDispatch,
  clearExecution,
  clearExport,
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
  clearWorkspace,
  clearWorkspaceFilter,
  clearWorkspaceView,
  createIntelligenceSnapshot,
  FEAT_75_ID,
  getWorkspace,
  getWorkspaceFilter,
  getWorkspaceView,
  WORKSPACE_FILTER_ENGINE_CAPABILITY,
  WORKSPACE_FILTER_KEYS,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearWorkspaceFilter();
  clearWorkspaceView();
  clearWorkspace();
  clearExport();
  clearDashboard();
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
    email: `${input.customerId}@wp74.example`,
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
    notes: "wp74 seed",
  });
}

function seedPipeline() {
  seedCustomer({
    customerId: "cust-wp74-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp74-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp74-1",
    customerId: "cust-wp74-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp74-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp74-1",
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
  const reports = buildReport({ archives });
  buildDashboard({ reports });
  buildWorkspace();
  buildWorkspaceView();
}

function main() {
  console.log("=== WP-74 / Workspace Filter Engine ===");

  resetAll();
  seedPipeline();

  const workspace = getWorkspace();
  const view = getWorkspaceView();
  const first = buildWorkspaceFilter({ workspace, view });

  assert(FEAT_75_ID === "FEAT-75", "FEAT-75");
  assert(
    WORKSPACE_FILTER_ENGINE_CAPABILITY === "WorkspaceFilterEngine",
    "WorkspaceFilterEngine",
  );
  assert(WORKSPACE_FILTER_KEYS.includes("all"), "filter key all");
  assert(WORKSPACE_FILTER_KEYS.includes("active"), "filter key active");
  assert(WORKSPACE_FILTER_KEYS.includes("metrics"), "filter key metrics");

  assert(typeof first.all.summary === "string", "all summary");
  assert(Array.isArray(first.active.pending), "active.pending");
  assert(Array.isArray(first.active.running), "active.running");
  assert(Array.isArray(first.important), "important");
  assert(Array.isArray(first.pending), "pending");
  assert(Array.isArray(first.running), "running");
  assert(Array.isArray(first.completed), "completed");
  assert(Array.isArray(first.attention), "attention");
  assert(Array.isArray(first.recommendations), "recommendations");
  assert(Array.isArray(first.insights), "insights");
  assert(Array.isArray(first.tasks), "tasks");
  assert(Array.isArray(first.plans), "plans");
  assert(Array.isArray(first.reports), "reports");

  assert(first.all.summary === view.summary, "all mirrors view");
  assert(
    first.important.map((i) => i.id).join("|") ===
      view.important.map((i) => i.id).join("|"),
    "important mirrors view",
  );
  assert(
    first.pending.map((i) => i.id).join("|") ===
      view.pending.map((i) => i.id).join("|"),
    "pending mirrors view",
  );
  assert(
    first.active.pending.map((i) => i.id).join("|") ===
      first.pending.map((i) => i.id).join("|"),
    "active.pending = pending",
  );
  assert(
    first.active.running.map((i) => i.id).join("|") ===
      first.running.map((i) => i.id).join("|"),
    "active.running = running",
  );
  assert(
    first.recommendations.map((r) => r.id).join("|") ===
      workspace.recommendations.map((r) => r.id).join("|"),
    "recommendations mirror workspace",
  );
  console.log("PASS Build");

  const second = buildWorkspaceFilter({ workspace, view });
  assert(second.all.summary === first.all.summary, "deterministic all");
  assert(
    second.important.map((i) => i.id).join("|") ===
      first.important.map((i) => i.id).join("|"),
    "deterministic important",
  );
  assert(
    second.active.pending.map((i) => i.id).join("|") ===
      first.active.pending.map((i) => i.id).join("|"),
    "deterministic active.pending",
  );
  assert(
    second.tasks.map((t) => t.id).join("|") ===
      first.tasks.map((t) => t.id).join("|"),
    "deterministic tasks",
  );
  console.log("PASS Deterministic");

  assert(
    first.important.map((i) => i.id).join("|") ===
      view.important.map((i) => i.id).join("|"),
    "important order preserved",
  );
  assert(
    first.pending.map((i) => i.id).join("|") ===
      view.pending.map((i) => i.id).join("|"),
    "pending order preserved",
  );
  assert(
    first.running.map((i) => i.id).join("|") ===
      view.running.map((i) => i.id).join("|"),
    "running order preserved",
  );
  assert(
    first.completed.map((i) => i.id).join("|") ===
      view.completed.map((i) => i.id).join("|"),
    "completed order preserved",
  );
  assert(
    first.attention.map((i) => i.id).join("|") ===
      view.attention.map((i) => i.id).join("|"),
    "attention order preserved",
  );
  for (let i = 1; i < first.tasks.length; i++) {
    assert(
      first.tasks[i - 1]!.position <= first.tasks[i]!.position,
      `task position order at ${i}`,
    );
  }
  console.log("PASS Ordering");

  resetAll();
  const emptyView = {
    summary: "",
    today: [] as const,
    important: [] as const,
    pending: [] as const,
    running: [] as const,
    completed: [] as const,
    attention: [] as const,
    recommendations: [] as const,
    insights: [] as const,
    tasks: [] as const,
    plans: [] as const,
    reports: [] as const,
    metrics: null,
  };
  const empty = buildWorkspaceFilter({ view: emptyView });
  assert(empty.all.summary === "", "empty all");
  assert(empty.active.pending.length === 0, "empty active.pending");
  assert(empty.active.running.length === 0, "empty active.running");
  assert(empty.important.length === 0, "empty important");
  assert(empty.pending.length === 0, "empty pending");
  assert(empty.running.length === 0, "empty running");
  assert(empty.completed.length === 0, "empty completed");
  assert(empty.attention.length === 0, "empty attention");
  assert(empty.recommendations.length === 0, "empty recommendations");
  assert(empty.insights.length === 0, "empty insights");
  assert(empty.tasks.length === 0, "empty tasks");
  assert(empty.plans.length === 0, "empty plans");
  assert(empty.reports.length === 0, "empty reports");
  assert(empty.metrics === null, "empty metrics");
  console.log("PASS Empty");

  resetAll();
  seedPipeline();
  clearWorkspaceFilter();
  const viaGet = getWorkspaceFilter();
  assert(typeof viaGet.all.summary === "string", "get builds");
  assert(Array.isArray(viaGet.recommendations), "get recommendations");
  const cached = getWorkspaceFilter();
  assert(cached.all.summary === viaGet.all.summary, "get cache");
  console.log("PASS API");

  resetAll();
  console.log("");
  console.log("PASS WP-74 Workspace Filter Engine");
  console.log("WP-74 verification complete");
}

main();
