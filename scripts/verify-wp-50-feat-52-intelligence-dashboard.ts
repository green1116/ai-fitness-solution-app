/**
 * WP-50 / FEAT-52 — Intelligence Dashboard verification.
 * Build / Get (reuses Context / Snapshot / Metrics).
 */
import {
  addExpansion,
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
  completeTask,
  createCustomerAutomation,
  createCustomerProfile,
  createWorkflow,
  enqueueTask,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
  startTask,
  startWorkflow,
  updateExpansionStatus,
  updateRenewalStatus,
} from "../lib/post-launch";
import {
  buildIntelligenceContext,
  buildIntelligenceDashboard,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  createIntelligenceSnapshot,
  FEAT_52_ID,
  getIntelligenceDashboard,
  INTELLIGENCE_DASHBOARD_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(input: {
  customerId: string;
  name: string;
  health: "GOOD" | "WARNING";
  score: number;
}) {
  registerCustomer({
    customerId: input.customerId,
    name: input.name,
    organization: `Org ${input.customerId}`,
    email: `${input.customerId}@wp50.example`,
  });
  createCustomerProfile({
    customerId: input.customerId,
    displayName: input.name,
  });
  setCustomerLifecycleStage({
    customerId: input.customerId,
    stage: "ACTIVE",
  });
  setCustomerHealth({
    customerId: input.customerId,
    score: input.score,
    level: input.health,
  });
  recordCustomerEngagement({
    customerId: input.customerId,
    type: "MEETING",
    notes: "dashboard seed",
  });
}

function resetAll() {
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

function main() {
  console.log("=== WP-50 FEAT-52 / Intelligence Dashboard ===");

  resetAll();

  // health 50, retention 100, expansion 100, automation 100 → overall 88
  seedFullCustomer({
    customerId: "cust-wp50-1",
    name: "Ada",
    health: "GOOD",
    score: 90,
  });
  seedFullCustomer({
    customerId: "cust-wp50-2",
    name: "Bob",
    health: "WARNING",
    score: 40,
  });

  addRenewal({
    customerId: "cust-wp50-1",
    renewalDate: "2026-12-01",
    value: 10000,
  });
  updateRenewalStatus({
    customerId: "cust-wp50-1",
    renewalStatus: "RENEWED",
  });
  addExpansion({
    customerId: "cust-wp50-2",
    expansionDate: "2026-11-01",
    value: 5000,
  });
  updateExpansionStatus({
    customerId: "cust-wp50-2",
    expansionStatus: "WON",
  });

  createCustomerAutomation({
    automationId: "auto-wp50-1",
    customerId: "cust-wp50-1",
    trigger: "AT_RISK",
    action: "CREATE_TASK",
  });
  createWorkflow({
    workflowId: "wf-wp50-1",
    automationId: "auto-wp50-1",
    steps: ["run"],
  });
  startWorkflow("wf-wp50-1");
  enqueueTask({
    taskId: "task-wp50-1",
    workflowId: "wf-wp50-1",
    title: "Complete me",
  });
  startTask("task-wp50-1");
  completeTask("task-wp50-1");

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp50-1",
    version: "v1",
  });

  const built = buildIntelligenceDashboard();
  assert(FEAT_52_ID === "FEAT-52", "FEAT-52");
  assert(
    INTELLIGENCE_DASHBOARD_CAPABILITY === "IntelligenceDashboard",
    "IntelligenceDashboard",
  );
  assert(built.dashboardId.length > 0, "dashboardId");
  assert(built.metricsId.length > 0, "metricsId");
  assert(built.overallScore === 88, "overallScore");
  assert(built.trend === "STABLE", "trend first build");
  assert(built.summary.includes("overall=88"), "summary");
  assert(built.summary.includes("snapshot=snap-wp50-1"), "summary snapshot");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getIntelligenceDashboard();
  assert(got.dashboardId === built.dashboardId, "Get dashboardId");
  assert(got.overallScore === built.overallScore, "Get overallScore");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  const rebuilt = buildIntelligenceDashboard();
  assert(rebuilt.trend === "STABLE", "trend rebuild same score");
  assert(rebuilt.overallScore === 88, "rebuild overall");
  console.log("PASS Trend");

  resetAll();
  console.log("");
  console.log("PASS FEAT-52 Intelligence Dashboard");
  console.log("WP-50 verification complete");
}

main();
