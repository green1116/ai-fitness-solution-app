/**
 * EP-4 / WP-4 — Application Workflow API
 * Deterministic read-only API descriptors derived from WorkflowView (WP-3).
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1~WP-3.
 */

import {
  EP_WORKFLOW_VIEW_BASELINE,
  getWorkflowView,
  type WorkflowView,
  type WorkflowViewStatus,
} from "./workflow-view";
import type { WorkflowAction, WorkflowScenario } from "./workflow-definition";

export const EP_4_WP4_ID = "WP-4" as const;
export const WORKFLOW_API_CAPABILITY = "WorkflowApi" as const;
export const EP_WORKFLOW_API_VERSION = "ep-4-wp-4-workflow-api-1" as const;
/** Reuses Pilot GA + EP-4 WP-1~WP-3 baseline. */
export const EP_WORKFLOW_API_BASELINE = EP_WORKFLOW_VIEW_BASELINE;

export const WORKFLOW_API_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
] as const;
export type WorkflowApiMethod = (typeof WORKFLOW_API_METHODS)[number];

export type WorkflowApiStatus = WorkflowViewStatus;

export type WorkflowApi = Readonly<{
  workflowId: string;
  scenario: WorkflowScenario;
  action: WorkflowAction;
  route: string;
  status: WorkflowApiStatus;
  availableActions: readonly WorkflowAction[];
  nextRoute: string;
  endpoint: string;
  method: WorkflowApiMethod;
}>;

let cachedApis: WorkflowApi[] | null = null;

function cloneApi(row: WorkflowApi): WorkflowApi {
  return {
    ...row,
    availableActions: [...row.availableActions],
  };
}

function sortStable(rows: readonly WorkflowApi[]): WorkflowApi[] {
  return [...rows].sort((a, b) => {
    const byId = a.workflowId.localeCompare(b.workflowId);
    if (byId !== 0) return byId;
    return a.endpoint.localeCompare(b.endpoint);
  });
}

function methodForAction(action: WorkflowAction): WorkflowApiMethod {
  switch (action) {
    case "ROUTE_TASK":
      return "POST";
    case "NOTIFY":
      return "POST";
    case "APPROVE":
      return "PUT";
    case "ARCHIVE":
      return "PATCH";
    default:
      return "GET";
  }
}

function endpointFor(view: WorkflowView): string {
  return `/api/v1/workflows/${view.workflowId}/${view.scenario.toLowerCase()}`;
}

function apiFromView(view: WorkflowView): WorkflowApi {
  return {
    workflowId: view.workflowId,
    scenario: view.scenario,
    action: view.action,
    route: view.route,
    status: view.status,
    availableActions: [...view.availableActions],
    nextRoute: view.nextRoute,
    endpoint: endpointFor(view),
    method: methodForAction(view.action),
  };
}

function deriveApis(views: readonly WorkflowView[]): WorkflowApi[] {
  return [...views]
    .sort((a, b) => a.workflowId.localeCompare(b.workflowId))
    .map(apiFromView);
}

/**
 * Build read-only Workflow API descriptors from EP-4 WP-3 views.
 */
export function buildWorkflowApi(): WorkflowApi[] {
  const views = getWorkflowView();
  const out = sortStable(deriveApis(views)).map(cloneApi);
  cachedApis = out.map(cloneApi);
  return cachedApis.map(cloneApi);
}

/**
 * Get the last built APIs, or build if none cached.
 */
export function getWorkflowApi(): WorkflowApi[] {
  if (!cachedApis) {
    return buildWorkflowApi();
  }
  return cachedApis.map(cloneApi);
}

/** Stable content fingerprint for determinism checks. */
export function workflowApiFingerprint(rows?: readonly WorkflowApi[]): string {
  const list = sortStable(rows ?? getWorkflowApi());
  return list
    .map((a) => {
      const actions = [...a.availableActions].sort().join(",");
      return `${a.workflowId}|${a.scenario}|${a.action}|${a.route}|${a.status}|${actions}|${a.nextRoute}|${a.endpoint}|${a.method}`;
    })
    .join(";");
}

/** Test helper — clears API cache only. */
export function clearWorkflowApi(): void {
  cachedApis = null;
}
