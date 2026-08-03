/**
 * WP-47 / FEAT-49 — Intelligence Context verification.
 * Build / Get (reuses Post-Launch baselines).
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
  createCustomerAutomation,
  createCustomerProfile,
  createWorkflow,
  enqueueTask,
  openSupportCase,
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
  clearIntelligenceContext,
  FEAT_49_ID,
  getIntelligenceContext,
  INTELLIGENCE_CONTEXT_CAPABILITY,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(input: {
  customerId: string;
  name: string;
  stage: "ACTIVE" | "RISK" | "CHURNED";
  health: "GOOD" | "WARNING";
  score: number;
}) {
  registerCustomer({
    customerId: input.customerId,
    name: input.name,
    organization: `Org ${input.customerId}`,
    email: `${input.customerId}@wp47.example`,
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
    notes: "intelligence seed",
  });
}

function resetAll() {
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
  console.log("=== WP-47 FEAT-49 / Intelligence Context ===");

  resetAll();

  seedFullCustomer({
    customerId: "cust-wp47-1",
    name: "Ada",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  seedFullCustomer({
    customerId: "cust-wp47-2",
    name: "Bob",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  openSupportCase({
    caseId: "case-wp47-1",
    customerId: "cust-wp47-1",
    subject: "Intelligence help",
  });

  addRenewal({
    customerId: "cust-wp47-1",
    renewalDate: "2026-12-01",
    value: 10000,
  });
  updateRenewalStatus({
    customerId: "cust-wp47-1",
    renewalStatus: "RENEWED",
  });
  addExpansion({
    customerId: "cust-wp47-2",
    expansionDate: "2026-11-01",
    value: 5000,
  });
  updateExpansionStatus({
    customerId: "cust-wp47-2",
    expansionStatus: "WON",
  });

  createCustomerAutomation({
    automationId: "auto-wp47-1",
    customerId: "cust-wp47-1",
    trigger: "AT_RISK",
    action: "START_WORKFLOW",
  });
  createWorkflow({
    workflowId: "wf-wp47-1",
    automationId: "auto-wp47-1",
    steps: ["notify", "act"],
  });
  startWorkflow("wf-wp47-1");
  enqueueTask({
    taskId: "task-wp47-1",
    workflowId: "wf-wp47-1",
    title: "Run insight",
  });
  startTask("task-wp47-1");

  const built = buildIntelligenceContext();
  assert(FEAT_49_ID === "FEAT-49", "FEAT-49");
  assert(
    INTELLIGENCE_CONTEXT_CAPABILITY === "IntelligenceContext",
    "IntelligenceContext",
  );
  assert(built.contextId.length > 0, "contextId");
  assert(built.customerSummary.totalCustomers === 2, "customerSummary.total");
  assert(built.customerSummary.atRiskCustomers === 1, "customerSummary.atRisk");
  assert(built.customerSummary.healthyCustomers === 1, "customerSummary.healthy");
  assert(built.operationsSummary.retentionRate === 1, "operations.retention");
  assert(built.operationsSummary.wonExpansions === 1, "operations.won");
  assert(
    typeof built.operationsSummary.optimizationScore === "number",
    "operations.score",
  );
  assert(built.analyticsSummary.openSupportCases === 1, "analytics.cases");
  assert(built.analyticsSummary.recentEngagements === 2, "analytics.engagements");
  assert(built.automationSummary.totalAutomations === 1, "automation.total");
  assert(built.automationSummary.activeWorkflows === 1, "automation.activeWf");
  assert(built.automationSummary.runningTasks === 1, "automation.running");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getIntelligenceContext();
  assert(got.contextId === built.contextId, "Get contextId cached");
  assert(
    got.customerSummary.totalCustomers ===
      built.customerSummary.totalCustomers,
    "Get customerSummary",
  );
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS FEAT-49 Intelligence Context");
  console.log("WP-47 verification complete");
}

main();
