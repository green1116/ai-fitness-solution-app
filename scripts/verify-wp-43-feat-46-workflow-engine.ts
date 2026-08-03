/**
 * WP-43 / FEAT-46 — Workflow Engine verification.
 * Create / Get / List / Start / Pause / Resume (reuses CustomerAutomation).
 */
import {
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
  clearWorkflows,
  createCustomerAutomation,
  createCustomerProfile,
  createWorkflow,
  FEAT_46_ID,
  getWorkflow,
  listWorkflow,
  pauseWorkflow,
  recordCustomerEngagement,
  registerCustomer,
  resumeWorkflow,
  setCustomerHealth,
  setCustomerLifecycleStage,
  startWorkflow,
  WORKFLOW_ENGINE_CAPABILITY,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp43.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "CALL",
    notes: "workflow seed",
  });
}

function resetAll() {
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
  console.log("=== WP-43 FEAT-46 / Workflow Engine ===");

  resetAll();
  seedFullCustomer("cust-wp43-1", "Ada");

  createCustomerAutomation({
    automationId: "auto-wp43-1",
    customerId: "cust-wp43-1",
    trigger: "AT_RISK",
    action: "START_WORKFLOW",
  });

  const created = createWorkflow({
    workflowId: "wf-wp43-1",
    automationId: "auto-wp43-1",
    steps: ["notify", "assign", "close"],
  });
  assert(FEAT_46_ID === "FEAT-46", "FEAT-46");
  assert(WORKFLOW_ENGINE_CAPABILITY === "WorkflowEngine", "WorkflowEngine");
  assert(created.workflowId === "wf-wp43-1", "Create workflowId");
  assert(created.automationId === "auto-wp43-1", "Create automationId");
  assert(created.status === "DRAFT", "Create status DRAFT");
  assert(created.steps.length === 3, "Create steps");
  assert(created.currentStep === 0, "Create currentStep");
  assert(created.updatedAt.includes("T"), "Create updatedAt");
  console.log("PASS Create");

  const got = getWorkflow("wf-wp43-1");
  assert(got !== undefined, "Get found");
  assert(got?.steps[1] === "assign", "Get steps");
  assert(getWorkflow("missing") === undefined, "Get missing");
  console.log("PASS Get");

  createWorkflow({
    workflowId: "wf-wp43-2",
    automationId: "auto-wp43-1",
    steps: ["review"],
    status: "DRAFT",
  });
  const all = listWorkflow();
  assert(all.length === 2, "List all");
  const drafts = listWorkflow({ status: "DRAFT" });
  assert(drafts.length === 2, "List DRAFT");
  const byAuto = listWorkflow({ automationId: "auto-wp43-1" });
  assert(byAuto.length === 2, "List by automation");
  console.log("PASS List");

  const started = startWorkflow("wf-wp43-1");
  assert(started.status === "ACTIVE", "Start ACTIVE");
  const paused = pauseWorkflow("wf-wp43-1");
  assert(paused.status === "PAUSED", "Pause PAUSED");
  const resumed = resumeWorkflow("wf-wp43-1");
  assert(resumed.status === "ACTIVE", "Resume ACTIVE");
  console.log("PASS Start/Pause/Resume");

  let missingAutoRejected = false;
  try {
    createWorkflow({
      automationId: "missing-auto",
      steps: ["x"],
    });
  } catch {
    missingAutoRejected = true;
  }
  assert(missingAutoRejected, "Reject missing automation");

  let startFromActiveRejected = false;
  try {
    startWorkflow("wf-wp43-1");
  } catch {
    startFromActiveRejected = true;
  }
  assert(startFromActiveRejected, "Reject start from ACTIVE");

  resetAll();
  console.log("");
  console.log("PASS FEAT-46 Workflow Engine");
  console.log("WP-43 verification complete");
}

main();
