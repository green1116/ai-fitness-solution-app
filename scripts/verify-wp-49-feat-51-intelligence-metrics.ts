/**
 * WP-49 / FEAT-51 — Intelligence Metrics verification.
 * Build / Get (reuses IntelligenceContext + IntelligenceSnapshot).
 */
import {
  addExpansion,
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
  createCustomerAutomation,
  createCustomerProfile,
  createWorkflow,
  enqueueTask,
  completeTask,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
  startTask,
  startWorkflow,
  updateExpansionStatus,
  addRenewal,
  updateRenewalStatus,
} from "../lib/post-launch";
import {
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  clearIntelligenceContext,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  createIntelligenceSnapshot,
  FEAT_51_ID,
  getIntelligenceMetrics,
  INTELLIGENCE_METRICS_CAPABILITY,
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
    email: `${input.customerId}@wp49.example`,
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
    type: "CALL",
    notes: "metrics seed",
  });
}

function resetAll() {
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
  console.log("=== WP-49 FEAT-51 / Intelligence Metrics ===");

  resetAll();

  // 1/2 healthy → healthScore = 50
  seedFullCustomer({
    customerId: "cust-wp49-1",
    name: "Ada",
    health: "GOOD",
    score: 90,
  });
  seedFullCustomer({
    customerId: "cust-wp49-2",
    name: "Bob",
    health: "WARNING",
    score: 40,
  });

  addRenewal({
    customerId: "cust-wp49-1",
    renewalDate: "2026-12-01",
    value: 10000,
  });
  updateRenewalStatus({
    customerId: "cust-wp49-1",
    renewalStatus: "RENEWED",
  });
  // retentionRate = 1 → retentionScore = 100

  addExpansion({
    customerId: "cust-wp49-2",
    expansionDate: "2026-11-01",
    value: 5000,
  });
  updateExpansionStatus({
    customerId: "cust-wp49-2",
    expansionStatus: "WON",
  });
  // wonExpansions = 1 → expansionScore = 100

  createCustomerAutomation({
    automationId: "auto-wp49-1",
    customerId: "cust-wp49-1",
    trigger: "AT_RISK",
    action: "CREATE_TASK",
  });
  createWorkflow({
    workflowId: "wf-wp49-1",
    automationId: "auto-wp49-1",
    steps: ["run"],
  });
  startWorkflow("wf-wp49-1");
  enqueueTask({
    taskId: "task-wp49-1",
    workflowId: "wf-wp49-1",
    title: "Complete me",
  });
  startTask("task-wp49-1");
  completeTask("task-wp49-1");
  // completed/total = 1 → base 100 + activeWorkflow 10 → clamp 100

  const context = buildIntelligenceContext();
  const snapshot = createIntelligenceSnapshot({
    snapshotId: "snap-wp49-1",
    version: "v1",
  });
  assert(snapshot.contextId === context.contextId, "snapshot context");

  const built = buildIntelligenceMetrics();
  assert(FEAT_51_ID === "FEAT-51", "FEAT-51");
  assert(
    INTELLIGENCE_METRICS_CAPABILITY === "IntelligenceMetrics",
    "IntelligenceMetrics",
  );
  assert(built.metricsId.length > 0, "metricsId");
  assert(built.snapshotId === "snap-wp49-1", "snapshotId");
  assert(built.healthScore === 50, "healthScore");
  assert(built.retentionScore === 100, "retentionScore");
  assert(built.expansionScore === 100, "expansionScore");
  assert(built.automationScore === 100, "automationScore");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getIntelligenceMetrics();
  assert(got.metricsId === built.metricsId, "Get metricsId");
  assert(got.healthScore === built.healthScore, "Get healthScore");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS FEAT-51 Intelligence Metrics");
  console.log("WP-49 verification complete");
}

main();
