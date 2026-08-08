/**
 * WP-73 — Workspace View Engine verification.
 * Read-only views projected from Workspace only.
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
  clearWorkspaceView,
  createIntelligenceSnapshot,
  FEAT_74_ID,
  getWorkspace,
  getWorkspaceView,
  WORKSPACE_VIEW_ENGINE_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp73.example`,
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
    notes: "wp73 seed",
  });
}

function seedPipeline() {
  seedCustomer({
    customerId: "cust-wp73-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp73-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp73-1",
    customerId: "cust-wp73-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp73-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp73-1",
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
}

function main() {
  console.log("=== WP-73 / Workspace View Engine ===");

  resetAll();
  seedPipeline();

  const workspace = getWorkspace();
  const first = buildWorkspaceView({ workspace });
  assert(FEAT_74_ID === "FEAT-74", "FEAT-74");
  assert(
    WORKSPACE_VIEW_ENGINE_CAPABILITY === "WorkspaceViewEngine",
    "WorkspaceViewEngine",
  );
  assert(typeof first.summary === "string", "summary view");
  assert(Array.isArray(first.today), "today view");
  assert(Array.isArray(first.important), "important view");
  assert(Array.isArray(first.pending), "pending view");
  assert(Array.isArray(first.running), "running view");
  assert(Array.isArray(first.completed), "completed view");
  assert(Array.isArray(first.attention), "attention view");
  assert(Array.isArray(first.recommendations), "recommendations view");
  assert(Array.isArray(first.insights), "insights view");
  assert(Array.isArray(first.tasks), "tasks view");
  assert(Array.isArray(first.plans), "plans view");
  assert(Array.isArray(first.reports), "reports view");
  assert(first.summary === workspace.summary, "summary mirrors workspace");
  assert(
    first.today.join("|") === workspace.today.join("|"),
    "today mirrors workspace",
  );
  assert(
    first.recommendations.map((r) => r.id).join("|") ===
      workspace.recommendations.map((r) => r.id).join("|"),
    "recommendations mirror workspace",
  );
  assert(
    first.tasks.map((t) => t.id).join("|") ===
      workspace.tasks.map((t) => t.id).join("|"),
    "tasks mirror workspace",
  );
  assert(
    first.plans.map((p) => p.id).join("|") ===
      workspace.plans.map((p) => p.id).join("|"),
    "plans mirror workspace",
  );
  assert(
    first.reports.map((r) => r.id).join("|") ===
      workspace.reports.map((r) => r.id).join("|"),
    "reports mirror workspace",
  );
  console.log("PASS Build");

  const second = buildWorkspaceView({ workspace });
  assert(second.summary === first.summary, "deterministic summary");
  assert(
    second.today.join("|") === first.today.join("|"),
    "deterministic today",
  );
  assert(
    second.recommendations.map((r) => r.id).join("|") ===
      first.recommendations.map((r) => r.id).join("|"),
    "deterministic recommendations",
  );
  assert(
    second.important.map((i) => i.id).join("|") ===
      first.important.map((i) => i.id).join("|"),
    "deterministic important",
  );
  assert(
    second.tasks.map((t) => t.id).join("|") ===
      first.tasks.map((t) => t.id).join("|"),
    "deterministic tasks",
  );
  console.log("PASS Deterministic");

  assert(
    first.today.join("|") === workspace.today.join("|"),
    "today order preserved",
  );
  assert(
    first.important.map((i) => i.id).join("|") ===
      workspace.important.map((i) => i.id).join("|"),
    "important order preserved",
  );
  assert(
    first.pending.map((i) => i.id).join("|") ===
      workspace.pending.map((i) => i.id).join("|"),
    "pending order preserved",
  );
  assert(
    first.running.map((i) => i.id).join("|") ===
      workspace.running.map((i) => i.id).join("|"),
    "running order preserved",
  );
  assert(
    first.completed.map((i) => i.id).join("|") ===
      workspace.completed.map((i) => i.id).join("|"),
    "completed order preserved",
  );
  assert(
    first.attention.map((i) => i.id).join("|") ===
      workspace.attention.map((i) => i.id).join("|"),
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
  const empty = buildWorkspaceView({
    workspace: {
      summary: "",
      today: [],
      important: [],
      pending: [],
      running: [],
      completed: [],
      attention: [],
      recommendations: [],
      insights: [],
      tasks: [],
      plans: [],
      reports: [],
      metrics: null,
    },
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
  assert(empty.metrics === null, "empty metrics");
  console.log("PASS Empty");

  resetAll();
  seedPipeline();
  clearWorkspaceView();
  const viaGet = getWorkspaceView();
  assert(typeof viaGet.summary === "string", "get builds");
  assert(Array.isArray(viaGet.recommendations), "get recommendations");
  const cached = getWorkspaceView();
  assert(cached.summary === viaGet.summary, "get cache");
  console.log("PASS API");

  resetAll();
  console.log("");
  console.log("PASS WP-73 Workspace View Engine");
  console.log("WP-73 verification complete");
}

main();
