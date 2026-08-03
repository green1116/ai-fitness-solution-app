/**
 * WP-45 / FEAT-48 — Automation Dashboard verification.
 * Build / Get (reuses CustomerAutomation / WorkflowEngine / TaskQueue).
 */
import {
  buildAutomationDashboard,
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
  failTask,
  FEAT_48_ID,
  getAutomationDashboard,
  AUTOMATION_DASHBOARD_CAPABILITY,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
  startTask,
  startWorkflow,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp45.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "CALL",
    notes: "automation dashboard seed",
  });
}

function resetAll() {
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
  console.log("=== WP-45 FEAT-48 / Automation Dashboard ===");

  resetAll();
  seedFullCustomer("cust-wp45-1", "Ada");
  seedFullCustomer("cust-wp45-2", "Bob");

  createCustomerAutomation({
    automationId: "auto-wp45-1",
    customerId: "cust-wp45-1",
    trigger: "AT_RISK",
    action: "START_WORKFLOW",
  });
  createCustomerAutomation({
    automationId: "auto-wp45-2",
    customerId: "cust-wp45-2",
    trigger: "RENEWAL_DUE",
    action: "CREATE_TASK",
  });

  createWorkflow({
    workflowId: "wf-wp45-1",
    automationId: "auto-wp45-1",
    steps: ["a", "b"],
  });
  createWorkflow({
    workflowId: "wf-wp45-2",
    automationId: "auto-wp45-2",
    steps: ["x"],
  });
  startWorkflow("wf-wp45-1");
  // wf-wp45-2 remains DRAFT → activeWorkflows = 1

  enqueueTask({
    taskId: "task-wp45-1",
    workflowId: "wf-wp45-1",
    title: "Pending task",
  });
  enqueueTask({
    taskId: "task-wp45-2",
    workflowId: "wf-wp45-1",
    title: "Running then done",
  });
  enqueueTask({
    taskId: "task-wp45-3",
    workflowId: "wf-wp45-2",
    title: "Running then fail",
  });
  enqueueTask({
    taskId: "task-wp45-4",
    workflowId: "wf-wp45-2",
    title: "Still pending",
  });

  startTask("task-wp45-2");
  completeTask("task-wp45-2");
  startTask("task-wp45-3");
  failTask("task-wp45-3");
  // pending: 1+4 = 2, running: 0, completed: 1, failed: 1

  const built = buildAutomationDashboard();
  assert(FEAT_48_ID === "FEAT-48", "FEAT-48");
  assert(
    AUTOMATION_DASHBOARD_CAPABILITY === "AutomationDashboard",
    "AutomationDashboard",
  );
  assert(built.totalAutomations === 2, "totalAutomations");
  assert(built.activeWorkflows === 1, "activeWorkflows");
  assert(built.pendingTasks === 2, "pendingTasks");
  assert(built.runningTasks === 0, "runningTasks");
  assert(built.completedTasks === 1, "completedTasks");
  assert(built.failedTasks === 1, "failedTasks");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getAutomationDashboard();
  assert(got.totalAutomations === built.totalAutomations, "Get total");
  assert(got.completedTasks === built.completedTasks, "Get completed");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS FEAT-48 Automation Dashboard");
  console.log("WP-45 verification complete");
}

main();
