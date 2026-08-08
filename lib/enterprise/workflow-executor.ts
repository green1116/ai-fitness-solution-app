/**
 * EP-4 / WP-6 — Application Workflow Executor
 * Deterministic read-only executor descriptors derived from WorkflowUiContract (WP-5).
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1~WP-5.
 */

import {
  EP_WORKFLOW_UI_CONTRACT_BASELINE,
  getWorkflowUiContract,
  type WorkflowUiComponent,
  type WorkflowUiContract,
  type WorkflowUiContractStatus,
} from "./workflow-ui-contract";
import type { WorkflowAction, WorkflowScenario } from "./workflow-definition";
import type { WorkflowApiMethod } from "./workflow-api";

export const EP_4_WP6_ID = "WP-6" as const;
export const WORKFLOW_EXECUTOR_CAPABILITY = "WorkflowExecutor" as const;
export const EP_WORKFLOW_EXECUTOR_VERSION =
  "ep-4-wp-6-workflow-executor-1" as const;
/** Reuses Pilot GA + EP-4 WP-1~WP-5 baseline. */
export const EP_WORKFLOW_EXECUTOR_BASELINE = EP_WORKFLOW_UI_CONTRACT_BASELINE;

export const WORKFLOW_HANDLERS = [
  "handleIntakeRoute",
  "handleExecutionNotify",
  "handleReviewApprove",
  "handleHandoffArchive",
] as const;
export type WorkflowHandler = (typeof WORKFLOW_HANDLERS)[number];

export type WorkflowExecutorStatus = WorkflowUiContractStatus;

export type WorkflowExecutor = Readonly<{
  workflowId: string;
  scenario: WorkflowScenario;
  action: WorkflowAction;
  route: string;
  endpoint: string;
  method: WorkflowApiMethod;
  uiComponent: WorkflowUiComponent;
  handler: WorkflowHandler;
  status: WorkflowExecutorStatus;
}>;

let cachedExecutors: WorkflowExecutor[] | null = null;

function cloneExecutor(row: WorkflowExecutor): WorkflowExecutor {
  return { ...row };
}

function sortStable(rows: readonly WorkflowExecutor[]): WorkflowExecutor[] {
  return [...rows].sort((a, b) => {
    const byId = a.workflowId.localeCompare(b.workflowId);
    if (byId !== 0) return byId;
    return a.handler.localeCompare(b.handler);
  });
}

function handlerFor(scenario: WorkflowScenario): WorkflowHandler {
  switch (scenario) {
    case "INTAKE":
      return "handleIntakeRoute";
    case "EXECUTION":
      return "handleExecutionNotify";
    case "REVIEW":
      return "handleReviewApprove";
    case "HANDOFF":
      return "handleHandoffArchive";
    default:
      return "handleIntakeRoute";
  }
}

function executorFromContract(
  contract: WorkflowUiContract,
): WorkflowExecutor {
  return {
    workflowId: contract.workflowId,
    scenario: contract.scenario,
    action: contract.action,
    route: contract.route,
    endpoint: contract.endpoint,
    method: contract.method,
    uiComponent: contract.uiComponent,
    handler: handlerFor(contract.scenario),
    status: contract.status,
  };
}

function deriveExecutors(
  contracts: readonly WorkflowUiContract[],
): WorkflowExecutor[] {
  return [...contracts]
    .sort((a, b) => a.workflowId.localeCompare(b.workflowId))
    .map(executorFromContract);
}

/**
 * Build read-only Workflow Executors from EP-4 WP-5 UI contracts.
 */
export function buildWorkflowExecutor(): WorkflowExecutor[] {
  const contracts = getWorkflowUiContract();
  const out = sortStable(deriveExecutors(contracts)).map(cloneExecutor);
  cachedExecutors = out.map(cloneExecutor);
  return cachedExecutors.map(cloneExecutor);
}

/**
 * Get the last built executors, or build if none cached.
 */
export function getWorkflowExecutor(): WorkflowExecutor[] {
  if (!cachedExecutors) {
    return buildWorkflowExecutor();
  }
  return cachedExecutors.map(cloneExecutor);
}

/** Stable content fingerprint for determinism checks. */
export function workflowExecutorFingerprint(
  rows?: readonly WorkflowExecutor[],
): string {
  const list = sortStable(rows ?? getWorkflowExecutor());
  return list
    .map(
      (e) =>
        `${e.workflowId}|${e.scenario}|${e.action}|${e.route}|${e.endpoint}|${e.method}|${e.uiComponent}|${e.handler}|${e.status}`,
    )
    .join(";");
}

/** Test helper — clears executor cache only. */
export function clearWorkflowExecutor(): void {
  cachedExecutors = null;
}
