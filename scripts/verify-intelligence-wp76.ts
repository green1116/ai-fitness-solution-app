/**
 * WP-76 — Workspace Panel Engine verification.
 * Read-only UI panels from Workspace layers.
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
  buildWorkspacePanel,
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
  clearWorkspacePanel,
  clearWorkspaceRouter,
  clearWorkspaceView,
  createIntelligenceSnapshot,
  FEAT_77_ID,
  getWorkspace,
  getWorkspacePanel,
  getWorkspaceRouter,
  WORKSPACE_PANEL_ENGINE_CAPABILITY,
  WORKSPACE_PANEL_KEYS,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearWorkspacePanel();
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
    email: `${input.customerId}@wp76.example`,
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
    notes: "wp76 seed",
  });
}

function seedPipeline() {
  seedCustomer({
    customerId: "cust-wp76-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp76-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp76-1",
    customerId: "cust-wp76-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp76-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp76-1",
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
  buildWorkspaceRouter();
}

function main() {
  console.log("=== WP-76 / Workspace Panel Engine ===");

  resetAll();
  seedPipeline();

  const workspace = getWorkspace();
  const router = getWorkspaceRouter();
  const first = buildWorkspacePanel({ workspace, router });

  assert(FEAT_77_ID === "FEAT-77", "FEAT-77");
  assert(
    WORKSPACE_PANEL_ENGINE_CAPABILITY === "WorkspacePanelEngine",
    "WorkspacePanelEngine",
  );
  assert(WORKSPACE_PANEL_KEYS.includes("summary"), "panel summary");
  assert(WORKSPACE_PANEL_KEYS.includes("active"), "panel active");
  assert(WORKSPACE_PANEL_KEYS.includes("metrics"), "panel metrics");

  assert(first.summary.id === "panel-summary", "summary id");
  assert(first.summary.key === "summary", "summary key");
  assert(first.summary.position === 1, "summary position");
  assert(first.summary.payload === router.summary, "summary payload");
  assert(first.today.id === "panel-today", "today id");
  assert(first.important.key === "important", "important key");
  assert(first.pending.key === "pending", "pending key");
  assert(first.running.key === "running", "running key");
  assert(first.completed.key === "completed", "completed key");
  assert(first.attention.key === "attention", "attention key");
  assert(first.recommendations.key === "recommendations", "recommendations key");
  assert(first.insights.key === "insights", "insights key");
  assert(first.tasks.key === "tasks", "tasks key");
  assert(first.plans.key === "plans", "plans key");
  assert(first.reports.key === "reports", "reports key");
  assert(first.metrics.key === "metrics", "metrics key");
  assert(first.active.key === "active", "active key");
  assert(first.active.position === 14, "active position");

  assert(
    first.today.payload.join("|") === router.today.join("|"),
    "today mirrors router",
  );
  assert(
    first.important.payload.map((i) => i.id).join("|") ===
      router.important.map((i) => i.id).join("|"),
    "important mirrors router",
  );
  assert(
    first.active.payload.pending.map((i) => i.id).join("|") ===
      router.active.pending.map((i) => i.id).join("|"),
    "active.pending mirrors router",
  );
  assert(
    first.recommendations.payload.map((r) => r.id).join("|") ===
      workspace.recommendations.map((r) => r.id).join("|"),
    "recommendations mirror workspace",
  );
  console.log("PASS Build");

  const second = buildWorkspacePanel({ workspace, router });
  assert(second.summary.payload === first.summary.payload, "deterministic summary");
  assert(
    second.today.payload.join("|") === first.today.payload.join("|"),
    "deterministic today",
  );
  assert(
    second.important.payload.map((i) => i.id).join("|") ===
      first.important.payload.map((i) => i.id).join("|"),
    "deterministic important",
  );
  assert(
    second.tasks.payload.map((t) => t.id).join("|") ===
      first.tasks.payload.map((t) => t.id).join("|"),
    "deterministic tasks",
  );
  assert(second.active.id === first.active.id, "deterministic active id");
  console.log("PASS Deterministic");

  const positions = WORKSPACE_PANEL_KEYS.map((key, index) => {
    const panel = first[key];
    assert(panel.position === index + 1, `position for ${key}`);
    return panel.position;
  });
  for (let i = 1; i < positions.length; i++) {
    assert(positions[i - 1]! < positions[i]!, `panel order at ${i}`);
  }
  assert(
    first.important.payload.map((i) => i.id).join("|") ===
      router.important.map((i) => i.id).join("|"),
    "important order preserved",
  );
  assert(
    first.pending.payload.map((i) => i.id).join("|") ===
      router.pending.map((i) => i.id).join("|"),
    "pending order preserved",
  );
  for (let i = 1; i < first.tasks.payload.length; i++) {
    assert(
      first.tasks.payload[i - 1]!.position <= first.tasks.payload[i]!.position,
      `task position order at ${i}`,
    );
  }
  console.log("PASS Ordering");

  resetAll();
  const emptyRouter = {
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
    active: { pending: [] as const, running: [] as const },
  };
  const empty = buildWorkspacePanel({ router: emptyRouter });
  assert(empty.summary.payload === "", "empty summary");
  assert(empty.today.payload.length === 0, "empty today");
  assert(empty.important.payload.length === 0, "empty important");
  assert(empty.pending.payload.length === 0, "empty pending");
  assert(empty.running.payload.length === 0, "empty running");
  assert(empty.completed.payload.length === 0, "empty completed");
  assert(empty.attention.payload.length === 0, "empty attention");
  assert(empty.recommendations.payload.length === 0, "empty recommendations");
  assert(empty.insights.payload.length === 0, "empty insights");
  assert(empty.tasks.payload.length === 0, "empty tasks");
  assert(empty.plans.payload.length === 0, "empty plans");
  assert(empty.reports.payload.length === 0, "empty reports");
  assert(empty.active.payload.pending.length === 0, "empty active.pending");
  assert(empty.active.payload.running.length === 0, "empty active.running");
  assert(empty.metrics.payload === null, "empty metrics");
  console.log("PASS Empty");

  resetAll();
  seedPipeline();
  clearWorkspacePanel();
  const viaGet = getWorkspacePanel();
  assert(viaGet.summary.id === "panel-summary", "get builds");
  assert(Array.isArray(viaGet.recommendations.payload), "get recommendations");
  const cached = getWorkspacePanel();
  assert(cached.summary.payload === viaGet.summary.payload, "get cache");
  console.log("PASS API");

  resetAll();
  console.log("");
  console.log("PASS WP-76 Workspace Panel Engine");
  console.log("WP-76 verification complete");
}

main();
