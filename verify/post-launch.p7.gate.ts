/**
 * Post-Launch P7 Baseline Freeze Gate
 * Freezes Customer Automation → Automation Dashboard baseline (FEAT-45…FEAT-48).
 * No feature / model / API changes — export + smoke verification only.
 */
import * as postLaunch from "../lib/post-launch";

export const POST_LAUNCH_P7_BASELINE_ID =
  "post-launch-p7-automation-baseline-v1" as const;

export const POST_LAUNCH_P7_FREEZE_VERSION =
  "post-launch-p7-freeze-1" as const;

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PostLaunchP7GateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
  baselineId: typeof POST_LAUNCH_P7_BASELINE_ID;
  freezeVersion: typeof POST_LAUNCH_P7_FREEZE_VERSION;
};

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function resetCustomerStack(): void {
  postLaunch.clearAutomationDashboard();
  postLaunch.clearTasks();
  postLaunch.clearWorkflows();
  postLaunch.clearCustomerAutomations();
  postLaunch.clearOptimizationDashboard();
  postLaunch.clearExpansionInsights();
  postLaunch.clearRetentionInsights();
  postLaunch.clearCustomerInsights();
  postLaunch.clearRetentionDashboard();
  postLaunch.clearExpansions();
  postLaunch.clearRenewals();
  postLaunch.clearCustomerAnalytics();
  postLaunch.clearCustomerSuccessDashboard();
  postLaunch.clearSupportCases();
  postLaunch.clearCustomerEngagements();
  postLaunch.clearCustomerHealth();
  postLaunch.clearCustomerLifecycles();
  postLaunch.clearCustomerProfiles();
  postLaunch.clearCustomers();
}

function assertExport(name: string, value: unknown): boolean {
  return typeof value !== "undefined";
}

/**
 * Run Post-Launch P7 freeze gate.
 */
export function checkPostLaunchP7Gate(): PostLaunchP7GateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P7-BASELINE",
      "freeze",
      "Post-Launch P7 baseline constants",
      POST_LAUNCH_P7_BASELINE_ID ===
        "post-launch-p7-automation-baseline-v1" &&
        POST_LAUNCH_P7_FREEZE_VERSION === "post-launch-p7-freeze-1",
      `baseline=${POST_LAUNCH_P7_BASELINE_ID}`,
    ),
  );

  const requiredExports: Array<{ id: string; name: string; value: unknown }> = [
    {
      id: "P7-EXP-AUTO",
      name: "createCustomerAutomation",
      value: postLaunch.createCustomerAutomation,
    },
    {
      id: "P7-EXP-WF",
      name: "createWorkflow",
      value: postLaunch.createWorkflow,
    },
    {
      id: "P7-EXP-TASK",
      name: "enqueueTask",
      value: postLaunch.enqueueTask,
    },
    {
      id: "P7-EXP-DASH",
      name: "buildAutomationDashboard",
      value: postLaunch.buildAutomationDashboard,
    },
    { id: "P7-EXP-FEAT45", name: "FEAT_45_ID", value: postLaunch.FEAT_45_ID },
    { id: "P7-EXP-FEAT46", name: "FEAT_46_ID", value: postLaunch.FEAT_46_ID },
    { id: "P7-EXP-FEAT47", name: "FEAT_47_ID", value: postLaunch.FEAT_47_ID },
    { id: "P7-EXP-FEAT48", name: "FEAT_48_ID", value: postLaunch.FEAT_48_ID },
    {
      id: "P7-EXP-CAP-AUTO",
      name: "CUSTOMER_AUTOMATION_CAPABILITY",
      value: postLaunch.CUSTOMER_AUTOMATION_CAPABILITY,
    },
    {
      id: "P7-EXP-CAP-WF",
      name: "WORKFLOW_ENGINE_CAPABILITY",
      value: postLaunch.WORKFLOW_ENGINE_CAPABILITY,
    },
    {
      id: "P7-EXP-CAP-TASK",
      name: "TASK_QUEUE_CAPABILITY",
      value: postLaunch.TASK_QUEUE_CAPABILITY,
    },
    {
      id: "P7-EXP-CAP-DASH",
      name: "AUTOMATION_DASHBOARD_CAPABILITY",
      value: postLaunch.AUTOMATION_DASHBOARD_CAPABILITY,
    },
  ];

  for (const exp of requiredExports) {
    const ok = assertExport(exp.name, exp.value);
    checks.push(
      check(
        exp.id,
        "export",
        `Export ${exp.name}`,
        ok,
        ok ? "exported" : "missing",
      ),
    );
  }

  resetCustomerStack();

  try {
    const customerId = "cust-p7-freeze-1";
    postLaunch.registerCustomer({
      customerId,
      name: "P7 Freeze Customer",
      organization: "Org P7",
      email: "p7@freeze.example",
    });
    postLaunch.createCustomerProfile({
      customerId,
      displayName: "P7 Profile",
    });
    postLaunch.setCustomerLifecycleStage({
      customerId,
      stage: "ACTIVE",
    });
    postLaunch.setCustomerHealth({
      customerId,
      score: 85,
      level: "GOOD",
    });
    postLaunch.recordCustomerEngagement({
      customerId,
      type: "CALL",
      notes: "p7 freeze",
    });

    const automation = postLaunch.createCustomerAutomation({
      automationId: "auto-p7-freeze-1",
      customerId,
      trigger: "AT_RISK",
      action: "START_WORKFLOW",
    });
    const gotAuto = postLaunch.getCustomerAutomation(automation.automationId);
    checks.push(
      check(
        "P7-AUTO",
        "Customer Automation",
        "Customer Automation create/get/list",
        automation.enabled === true &&
          gotAuto?.trigger === "AT_RISK" &&
          postLaunch.listCustomerAutomation().length === 1 &&
          postLaunch.FEAT_45_ID === "FEAT-45",
        `automationId=${automation.automationId}`,
      ),
    );

    const workflow = postLaunch.createWorkflow({
      workflowId: "wf-p7-freeze-1",
      automationId: automation.automationId,
      steps: ["notify", "act", "close"],
    });
    const started = postLaunch.startWorkflow(workflow.workflowId);
    const gotWf = postLaunch.getWorkflow(workflow.workflowId);
    checks.push(
      check(
        "P7-WF",
        "Workflow Engine",
        "Workflow Engine create/start/get",
        workflow.status === "DRAFT" &&
          started.status === "ACTIVE" &&
          gotWf?.status === "ACTIVE" &&
          postLaunch.FEAT_46_ID === "FEAT-46",
        `workflowId=${workflow.workflowId}`,
      ),
    );

    const task = postLaunch.enqueueTask({
      taskId: "task-p7-freeze-1",
      workflowId: workflow.workflowId,
      title: "P7 freeze task",
      payload: { source: "p7" },
    });
    const running = postLaunch.startTask(task.taskId);
    const done = postLaunch.completeTask(task.taskId);
    checks.push(
      check(
        "P7-TASK",
        "Task Queue",
        "Task Queue enqueue/start/complete",
        task.status === "PENDING" &&
          running.status === "RUNNING" &&
          done.status === "DONE" &&
          postLaunch.listTasks({ workflowId: workflow.workflowId }).length ===
            1 &&
          postLaunch.FEAT_47_ID === "FEAT-47",
        `taskId=${task.taskId}`,
      ),
    );

    const dash = postLaunch.buildAutomationDashboard();
    const gotDash = postLaunch.getAutomationDashboard();
    checks.push(
      check(
        "P7-DASH",
        "Automation Dashboard",
        "Automation Dashboard build/get",
        dash.totalAutomations === 1 &&
          dash.activeWorkflows === 1 &&
          dash.completedTasks === 1 &&
          dash.pendingTasks === 0 &&
          gotDash.updatedAt === dash.updatedAt &&
          postLaunch.FEAT_48_ID === "FEAT-48",
        `totalAutomations=${dash.totalAutomations}`,
      ),
    );
  } catch (err) {
    checks.push(
      check(
        "P7-SMOKE",
        "smoke",
        "P7 smoke flow",
        false,
        err instanceof Error ? err.message : String(err),
      ),
    );
  } finally {
    resetCustomerStack();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: `post-launch-p7 gate ${result.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    baselineId: POST_LAUNCH_P7_BASELINE_ID,
    freezeVersion: POST_LAUNCH_P7_FREEZE_VERSION,
  };
}

export function assertPostLaunchP7GatePass(
  result: PostLaunchP7GateResult,
): asserts result is PostLaunchP7GateResult & { result: "PASS" } {
  if (result.result !== "PASS") {
    throw new Error(`post-launch p7 gate failed: ${result.summary}`);
  }
}
