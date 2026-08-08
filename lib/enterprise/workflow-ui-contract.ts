/**
 * EP-4 / WP-5 — Application Workflow UI Contract
 * Deterministic read-only UI contracts derived from WorkflowApi (WP-4).
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1~WP-4.
 */

import {
  EP_WORKFLOW_API_BASELINE,
  getWorkflowApi,
  type WorkflowApi,
  type WorkflowApiMethod,
  type WorkflowApiStatus,
} from "./workflow-api";
import type { WorkflowAction, WorkflowScenario } from "./workflow-definition";

export const EP_4_WP5_ID = "WP-5" as const;
export const WORKFLOW_UI_CONTRACT_CAPABILITY = "WorkflowUiContract" as const;
export const EP_WORKFLOW_UI_CONTRACT_VERSION =
  "ep-4-wp-5-workflow-ui-contract-1" as const;
/** Reuses Pilot GA + EP-4 WP-1~WP-4 baseline. */
export const EP_WORKFLOW_UI_CONTRACT_BASELINE = EP_WORKFLOW_API_BASELINE;

export const WORKFLOW_UI_COMPONENTS = [
  "WorkflowIntakePanel",
  "WorkflowExecutionPanel",
  "WorkflowReviewPanel",
  "WorkflowHandoffPanel",
] as const;
export type WorkflowUiComponent = (typeof WORKFLOW_UI_COMPONENTS)[number];

export type WorkflowUiContractStatus = WorkflowApiStatus;

export type WorkflowUiContract = Readonly<{
  workflowId: string;
  scenario: WorkflowScenario;
  action: WorkflowAction;
  route: string;
  endpoint: string;
  method: WorkflowApiMethod;
  status: WorkflowUiContractStatus;
  availableActions: readonly WorkflowAction[];
  nextRoute: string;
  uiComponent: WorkflowUiComponent;
}>;

let cachedContracts: WorkflowUiContract[] | null = null;

function cloneContract(row: WorkflowUiContract): WorkflowUiContract {
  return {
    ...row,
    availableActions: [...row.availableActions],
  };
}

function sortStable(
  rows: readonly WorkflowUiContract[],
): WorkflowUiContract[] {
  return [...rows].sort((a, b) => {
    const byId = a.workflowId.localeCompare(b.workflowId);
    if (byId !== 0) return byId;
    return a.uiComponent.localeCompare(b.uiComponent);
  });
}

function uiComponentFor(scenario: WorkflowScenario): WorkflowUiComponent {
  switch (scenario) {
    case "INTAKE":
      return "WorkflowIntakePanel";
    case "EXECUTION":
      return "WorkflowExecutionPanel";
    case "REVIEW":
      return "WorkflowReviewPanel";
    case "HANDOFF":
      return "WorkflowHandoffPanel";
    default:
      return "WorkflowIntakePanel";
  }
}

function contractFromApi(api: WorkflowApi): WorkflowUiContract {
  return {
    workflowId: api.workflowId,
    scenario: api.scenario,
    action: api.action,
    route: api.route,
    endpoint: api.endpoint,
    method: api.method,
    status: api.status,
    availableActions: [...api.availableActions],
    nextRoute: api.nextRoute,
    uiComponent: uiComponentFor(api.scenario),
  };
}

function deriveContracts(apis: readonly WorkflowApi[]): WorkflowUiContract[] {
  return [...apis]
    .sort((a, b) => a.workflowId.localeCompare(b.workflowId))
    .map(contractFromApi);
}

/**
 * Build read-only Workflow UI Contracts from EP-4 WP-4 APIs.
 */
export function buildWorkflowUiContract(): WorkflowUiContract[] {
  const apis = getWorkflowApi();
  const out = sortStable(deriveContracts(apis)).map(cloneContract);
  cachedContracts = out.map(cloneContract);
  return cachedContracts.map(cloneContract);
}

/**
 * Get the last built contracts, or build if none cached.
 */
export function getWorkflowUiContract(): WorkflowUiContract[] {
  if (!cachedContracts) {
    return buildWorkflowUiContract();
  }
  return cachedContracts.map(cloneContract);
}

/** Stable content fingerprint for determinism checks. */
export function workflowUiContractFingerprint(
  rows?: readonly WorkflowUiContract[],
): string {
  const list = sortStable(rows ?? getWorkflowUiContract());
  return list
    .map((c) => {
      const actions = [...c.availableActions].sort().join(",");
      return `${c.workflowId}|${c.scenario}|${c.action}|${c.route}|${c.endpoint}|${c.method}|${c.status}|${actions}|${c.nextRoute}|${c.uiComponent}`;
    })
    .join(";");
}

/** Test helper — clears UI contract cache only. */
export function clearWorkflowUiContract(): void {
  cachedContracts = null;
}
