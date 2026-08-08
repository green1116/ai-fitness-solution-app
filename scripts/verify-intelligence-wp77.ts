/**
 * WP-77 — Workspace Card Engine verification.
 * Read-only cards from Workspace panels.
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
  buildWorkspaceCard,
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
  clearWorkspaceCard,
  clearWorkspaceFilter,
  clearWorkspacePanel,
  clearWorkspaceRouter,
  clearWorkspaceView,
  createIntelligenceSnapshot,
  FEAT_78_ID,
  getWorkspace,
  getWorkspaceCard,
  getWorkspacePanel,
  WORKSPACE_CARD_ENGINE_CAPABILITY,
  WORKSPACE_CARD_KEYS,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearWorkspaceCard();
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
    email: `${input.customerId}@wp77.example`,
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
    notes: "wp77 seed",
  });
}

function seedPipeline() {
  seedCustomer({
    customerId: "cust-wp77-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp77-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp77-1",
    customerId: "cust-wp77-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp77-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp77-1",
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
  buildWorkspacePanel();
}

function main() {
  console.log("=== WP-77 / Workspace Card Engine ===");

  resetAll();
  seedPipeline();

  const workspace = getWorkspace();
  const panel = getWorkspacePanel();
  const first = buildWorkspaceCard({ workspace, panel });

  assert(FEAT_78_ID === "FEAT-78", "FEAT-78");
  assert(
    WORKSPACE_CARD_ENGINE_CAPABILITY === "WorkspaceCardEngine",
    "WorkspaceCardEngine",
  );
  assert(WORKSPACE_CARD_KEYS.includes("summary"), "card summary");
  assert(WORKSPACE_CARD_KEYS.includes("active"), "card active");
  assert(WORKSPACE_CARD_KEYS.includes("metrics"), "card metrics");

  assert(first.summary.id === "card-summary", "summary id");
  assert(first.summary.key === "summary", "summary key");
  assert(first.summary.panelId === panel.summary.id, "summary panelId");
  assert(first.summary.position === panel.summary.position, "summary position");
  assert(first.summary.payload === panel.summary.payload, "summary payload");
  assert(first.today.id === "card-today", "today id");
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
  assert(first.active.panelId === "panel-active", "active panelId");

  assert(
    first.today.payload.join("|") === panel.today.payload.join("|"),
    "today mirrors panel",
  );
  assert(
    first.important.payload.map((i) => i.id).join("|") ===
      panel.important.payload.map((i) => i.id).join("|"),
    "important mirrors panel",
  );
  assert(
    first.active.payload.pending.map((i) => i.id).join("|") ===
      panel.active.payload.pending.map((i) => i.id).join("|"),
    "active.pending mirrors panel",
  );
  assert(
    first.recommendations.payload.map((r) => r.id).join("|") ===
      workspace.recommendations.map((r) => r.id).join("|"),
    "recommendations mirror workspace",
  );
  console.log("PASS Build");

  const second = buildWorkspaceCard({ workspace, panel });
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

  const positions = WORKSPACE_CARD_KEYS.map((key, index) => {
    const card = first[key];
    assert(card.position === index + 1, `position for ${key}`);
    assert(card.panelId === `panel-${key}`, `panelId for ${key}`);
    return card.position;
  });
  for (let i = 1; i < positions.length; i++) {
    assert(positions[i - 1]! < positions[i]!, `card order at ${i}`);
  }
  assert(
    first.important.payload.map((i) => i.id).join("|") ===
      panel.important.payload.map((i) => i.id).join("|"),
    "important order preserved",
  );
  assert(
    first.pending.payload.map((i) => i.id).join("|") ===
      panel.pending.payload.map((i) => i.id).join("|"),
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
  const emptyPanel = buildWorkspacePanel({
    router: {
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
      active: { pending: [], running: [] },
    },
  });
  const empty = buildWorkspaceCard({ panel: emptyPanel });
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
  clearWorkspaceCard();
  const viaGet = getWorkspaceCard();
  assert(viaGet.summary.id === "card-summary", "get builds");
  assert(Array.isArray(viaGet.recommendations.payload), "get recommendations");
  const cached = getWorkspaceCard();
  assert(cached.summary.payload === viaGet.summary.payload, "get cache");
  console.log("PASS API");

  resetAll();
  console.log("");
  console.log("PASS WP-77 Workspace Card Engine");
  console.log("WP-77 verification complete");
}

main();
