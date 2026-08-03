/**
 * WP-44 / FEAT-47 — Task Queue verification.
 * Enqueue / Get / List / Start / Complete / Fail (reuses Automation + Workflow).
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
  clearTasks,
  clearWorkflows,
  completeTask,
  createCustomerAutomation,
  createCustomerProfile,
  createWorkflow,
  enqueueTask,
  failTask,
  FEAT_47_ID,
  getTask,
  listTasks,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
  startTask,
  TASK_QUEUE_CAPABILITY,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp44.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "MEETING",
    notes: "task queue seed",
  });
}

function resetAll() {
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
  console.log("=== WP-44 FEAT-47 / Task Queue ===");

  resetAll();
  seedFullCustomer("cust-wp44-1", "Ada");

  createCustomerAutomation({
    automationId: "auto-wp44-1",
    customerId: "cust-wp44-1",
    trigger: "RENEWAL_DUE",
    action: "CREATE_TASK",
  });
  createWorkflow({
    workflowId: "wf-wp44-1",
    automationId: "auto-wp44-1",
    steps: ["enqueue", "run", "finish"],
  });

  const enqueued = enqueueTask({
    taskId: "task-wp44-1",
    workflowId: "wf-wp44-1",
    title: "Notify CSM",
    payload: { channel: "email", priority: 1 },
  });
  assert(FEAT_47_ID === "FEAT-47", "FEAT-47");
  assert(TASK_QUEUE_CAPABILITY === "TaskQueue", "TaskQueue");
  assert(enqueued.taskId === "task-wp44-1", "Enqueue taskId");
  assert(enqueued.workflowId === "wf-wp44-1", "Enqueue workflowId");
  assert(enqueued.status === "PENDING", "Enqueue PENDING");
  assert(enqueued.title === "Notify CSM", "Enqueue title");
  assert(enqueued.payload.channel === "email", "Enqueue payload");
  assert(enqueued.updatedAt.includes("T"), "Enqueue updatedAt");
  console.log("PASS Enqueue");

  const got = getTask("task-wp44-1");
  assert(got !== undefined, "Get found");
  assert(got?.title === "Notify CSM", "Get title");
  assert(getTask("missing") === undefined, "Get missing");
  console.log("PASS Get");

  enqueueTask({
    taskId: "task-wp44-2",
    workflowId: "wf-wp44-1",
    title: "Open ticket",
  });
  const all = listTasks();
  assert(all.length === 2, "List all");
  const pending = listTasks({ status: "PENDING" });
  assert(pending.length === 2, "List PENDING");
  const byWf = listTasks({ workflowId: "wf-wp44-1" });
  assert(byWf.length === 2, "List by workflow");
  console.log("PASS List");

  const started = startTask("task-wp44-1");
  assert(started.status === "RUNNING", "Start RUNNING");
  const completed = completeTask("task-wp44-1");
  assert(completed.status === "DONE", "Complete DONE");

  const started2 = startTask("task-wp44-2");
  assert(started2.status === "RUNNING", "Start second");
  const failed = failTask("task-wp44-2");
  assert(failed.status === "FAILED", "Fail FAILED");
  console.log("PASS Start/Complete/Fail");

  let missingWorkflowRejected = false;
  try {
    enqueueTask({
      workflowId: "missing-wf",
      title: "x",
    });
  } catch {
    missingWorkflowRejected = true;
  }
  assert(missingWorkflowRejected, "Reject missing workflow");

  let startFromDoneRejected = false;
  try {
    startTask("task-wp44-1");
  } catch {
    startFromDoneRejected = true;
  }
  assert(startFromDoneRejected, "Reject start from DONE");

  resetAll();
  console.log("");
  console.log("PASS FEAT-47 Task Queue");
  console.log("WP-44 verification complete");
}

main();
