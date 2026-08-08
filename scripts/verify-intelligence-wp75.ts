/**
 * WP-75 — Workspace Router Engine verification.
 * Read-only routes over Workspace / View / Filter layers.
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
  buildWorkspaceRouter,
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
  clearWorkspaceRouter,
  clearWorkspaceView,
  createIntelligenceSnapshot,
  FEAT_76_ID,
  getWorkspace,
  getWorkspaceFilter,
  getWorkspaceRouter,
  getWorkspaceView,
  WORKSPACE_ROUTE_KEYS,
  WORKSPACE_ROUTER_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearWorkspaceRouter();
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
    email: `${input.customerId}@wp75.example`,
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
    notes: "wp75 seed",
  });
}

function seedPipeline() {
  seedCustomer({
    customerId: "cust-wp75-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp75-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp75-1",
    customerId: "cust-wp75-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp75-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp75-1",
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
  buildWorkspaceFilter();
}

function main() {
  console.log("=== WP-75 / Workspace Router Engine ===");

  resetAll();
  seedPipeline();

  const workspace = getWorkspace();
  const view = getWorkspaceView();
  const filter = getWorkspaceFilter();
  const first = buildWorkspaceRouter({ workspace, view, filter });

  assert(FEAT_76_ID === "FEAT-76", "FEAT-76");
  assert(
    WORKSPACE_ROUTER_ENGINE_CAPABILITY === "WorkspaceRouterEngine",
    "WorkspaceRouterEngine",
  );
  assert(WORKSPACE_ROUTE_KEYS.includes("summary"), "route summary");
  assert(WORKSPACE_ROUTE_KEYS.includes("today"), "route today");
  assert(WORKSPACE_ROUTE_KEYS.includes("active"), "route active");
  assert(WORKSPACE_ROUTE_KEYS.includes("metrics"), "route metrics");

  assert(typeof first.summary === "string", "summary route");
  assert(Array.isArray(first.today), "today route");
  assert(Array.isArray(first.important), "important route");
  assert(Array.isArray(first.pending), "pending route");
  assert(Array.isArray(first.running), "running route");
  assert(Array.isArray(first.completed), "completed route");
  assert(Array.isArray(first.attention), "attention route");
  assert(Array.isArray(first.recommendations), "recommendations route");
  assert(Array.isArray(first.insights), "insights route");
  assert(Array.isArray(first.tasks), "tasks route");
  assert(Array.isArray(first.plans), "plans route");
  assert(Array.isArray(first.reports), "reports route");
  assert(Array.isArray(first.active.pending), "active.pending route");
  assert(Array.isArray(first.active.running), "active.running route");

  assert(first.summary === view.summary, "summary mirrors view");
  assert(
    first.today.join("|") === view.today.join("|"),
    "today mirrors view",
  );
  assert(
    first.important.map((i) => i.id).join("|") ===
      filter.important.map((i) => i.id).join("|"),
    "important mirrors filter",
  );
  assert(
    first.active.pending.map((i) => i.id).join("|") ===
      filter.active.pending.map((i) => i.id).join("|"),
    "active.pending mirrors filter",
  );
  assert(
    first.recommendations.map((r) => r.id).join("|") ===
      workspace.recommendations.map((r) => r.id).join("|"),
    "recommendations mirror workspace",
  );
  console.log("PASS Build");

  const second = buildWorkspaceRouter({ workspace, view, filter });
  assert(second.summary === first.summary, "deterministic summary");
  assert(
    second.today.join("|") === first.today.join("|"),
    "deterministic today",
  );
  assert(
    second.important.map((i) => i.id).join("|") ===
      first.important.map((i) => i.id).join("|"),
    "deterministic important",
  );
  assert(
    second.active.running.map((i) => i.id).join("|") ===
      first.active.running.map((i) => i.id).join("|"),
    "deterministic active.running",
  );
  assert(
    second.tasks.map((t) => t.id).join("|") ===
      first.tasks.map((t) => t.id).join("|"),
    "deterministic tasks",
  );
  console.log("PASS Deterministic");

  assert(
    first.today.join("|") === view.today.join("|"),
    "today order preserved",
  );
  assert(
    first.important.map((i) => i.id).join("|") ===
      filter.important.map((i) => i.id).join("|"),
    "important order preserved",
  );
  assert(
    first.pending.map((i) => i.id).join("|") ===
      filter.pending.map((i) => i.id).join("|"),
    "pending order preserved",
  );
  assert(
    first.running.map((i) => i.id).join("|") ===
      filter.running.map((i) => i.id).join("|"),
    "running order preserved",
  );
  assert(
    first.completed.map((i) => i.id).join("|") ===
      filter.completed.map((i) => i.id).join("|"),
    "completed order preserved",
  );
  assert(
    first.attention.map((i) => i.id).join("|") ===
      filter.attention.map((i) => i.id).join("|"),
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
  const emptyFilter = {
    all: emptyView,
    active: { pending: [] as const, running: [] as const },
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
  const empty = buildWorkspaceRouter({
    view: emptyView,
    filter: emptyFilter,
  });
  assert(empty.summary === "", "empty summary");
  assert(empty.today.length === 0, "empty today");
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
  assert(empty.active.pending.length === 0, "empty active.pending");
  assert(empty.active.running.length === 0, "empty active.running");
  assert(empty.metrics === null, "empty metrics");
  console.log("PASS Empty");

  resetAll();
  seedPipeline();
  clearWorkspaceRouter();
  const viaGet = getWorkspaceRouter();
  assert(typeof viaGet.summary === "string", "get builds");
  assert(Array.isArray(viaGet.recommendations), "get recommendations");
  const cached = getWorkspaceRouter();
  assert(cached.summary === viaGet.summary, "get cache");
  console.log("PASS API");

  resetAll();
  console.log("");
  console.log("PASS WP-75 Workspace Router Engine");
  console.log("WP-75 verification complete");
}

main();
