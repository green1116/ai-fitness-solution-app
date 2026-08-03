/**
 * FEAT-48 — Automation Dashboard
 * Aggregates CustomerAutomation / WorkflowEngine / TaskQueue.
 */
import { listCustomerAutomation } from "./customer-automation";
import { listWorkflow } from "./workflow-engine";
import { listTasks } from "./task-queue";

export const FEAT_48_ID = "FEAT-48" as const;
export const AUTOMATION_DASHBOARD_CAPABILITY = "AutomationDashboard" as const;

export type AutomationDashboard = Readonly<{
  totalAutomations: number;
  activeWorkflows: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  updatedAt: string;
}>;

let cachedDashboard: AutomationDashboard | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneDashboard(row: AutomationDashboard): AutomationDashboard {
  return { ...row };
}

/**
 * Build (and cache) the automation dashboard from automation stack.
 */
export function buildAutomationDashboard(): AutomationDashboard {
  const automations = listCustomerAutomation();
  const workflows = listWorkflow();
  const tasks = listTasks();

  const dashboard: AutomationDashboard = {
    totalAutomations: automations.length,
    activeWorkflows: workflows.filter((w) => w.status === "ACTIVE").length,
    pendingTasks: tasks.filter((t) => t.status === "PENDING").length,
    runningTasks: tasks.filter((t) => t.status === "RUNNING").length,
    completedTasks: tasks.filter((t) => t.status === "DONE").length,
    failedTasks: tasks.filter((t) => t.status === "FAILED").length,
    updatedAt: nowIso(),
  };
  cachedDashboard = dashboard;
  return cloneDashboard(dashboard);
}

/**
 * Get the last built automation dashboard, or build one if none cached.
 */
export function getAutomationDashboard(): AutomationDashboard {
  if (!cachedDashboard) {
    return buildAutomationDashboard();
  }
  return cloneDashboard(cachedDashboard);
}

/** Test helper — clears cached automation dashboard. */
export function clearAutomationDashboard(): void {
  cachedDashboard = null;
}
