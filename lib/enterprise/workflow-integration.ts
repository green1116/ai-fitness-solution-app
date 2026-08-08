/**
 * EP-4 / WP-7 — Workflow Integration
 * Read-only integration of WorkflowExecutor into existing app routes / APIs / handlers.
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1~WP-6.
 */

import {
  EP_WORKFLOW_EXECUTOR_BASELINE,
  getWorkflowExecutor,
  type WorkflowExecutor,
  type WorkflowExecutorStatus,
  type WorkflowHandler,
} from "./workflow-executor";
import type { WorkflowAction, WorkflowScenario } from "./workflow-definition";
import type { WorkflowApiMethod } from "./workflow-api";

export const EP_4_WP7_ID = "WP-7" as const;
export const WORKFLOW_INTEGRATION_CAPABILITY = "WorkflowIntegration" as const;
export const EP_WORKFLOW_INTEGRATION_VERSION =
  "ep-4-wp-7-workflow-integration-1" as const;
/** Reuses Pilot GA + EP-4 WP-1~WP-6 baseline. */
export const EP_WORKFLOW_INTEGRATION_BASELINE = EP_WORKFLOW_EXECUTOR_BASELINE;

export type WorkflowIntegrationStatus = WorkflowExecutorStatus;

/**
 * Deterministic surface map onto existing app routes / APIs / handlers.
 * Logical executor route/endpoint remain descriptors; resolved* are real surfaces.
 */
export type WorkflowAppSurface = Readonly<{
  appRoute: string;
  appEndpoint: string;
  appMethod: WorkflowApiMethod;
  appHandler: string;
  uiSurface: string;
}>;

export type WorkflowIntegration = Readonly<{
  workflowId: string;
  scenario: WorkflowScenario;
  action: WorkflowAction;
  route: string;
  endpoint: string;
  method: WorkflowApiMethod;
  handler: WorkflowHandler;
  status: WorkflowIntegrationStatus;
  appRoute: string;
  appEndpoint: string;
  appMethod: WorkflowApiMethod;
  appHandler: string;
  uiSurface: string;
  routeResolved: true;
  endpointResolved: true;
}>;

const SURFACE_BY_SCENARIO: Readonly<
  Record<WorkflowScenario, WorkflowAppSurface>
> = {
  INTAKE: {
    appRoute: "/pilot/intake",
    appEndpoint: "/api/pilot/v80/intake/upload",
    appMethod: "POST",
    appHandler: "uploadTenderIntake",
    uiSurface: "IntakeReviewEditor",
  },
  EXECUTION: {
    appRoute: "/dashboard/command-center",
    appEndpoint: "/api/operations/command/dispatch",
    appMethod: "POST",
    appHandler: "postCommandDispatch",
    uiSurface: "IntakeOpsDashboard",
  },
  REVIEW: {
    appRoute: "/pilot/intake",
    appEndpoint: "/api/pilot/v80/intake/approve",
    appMethod: "POST",
    appHandler: "approveTenderIntake",
    uiSurface: "IntakeSignoffPanel",
  },
  HANDOFF: {
    appRoute: "/pilot/intake",
    appEndpoint: "/api/pilot/v80/intake/handoff-package",
    appMethod: "POST",
    appHandler: "buildIntakeHandoffPackage",
    uiSurface: "IntakeHandoffPackagePanel",
  },
};

let cachedIntegrations: WorkflowIntegration[] | null = null;

function cloneIntegration(row: WorkflowIntegration): WorkflowIntegration {
  return { ...row };
}

function sortStable(
  rows: readonly WorkflowIntegration[],
): WorkflowIntegration[] {
  return [...rows].sort((a, b) => {
    const byId = a.workflowId.localeCompare(b.workflowId);
    if (byId !== 0) return byId;
    return a.appEndpoint.localeCompare(b.appEndpoint);
  });
}

function surfaceFor(scenario: WorkflowScenario): WorkflowAppSurface {
  return SURFACE_BY_SCENARIO[scenario];
}

function integrateFromExecutor(
  executor: WorkflowExecutor,
): WorkflowIntegration {
  const surface = surfaceFor(executor.scenario);
  return {
    workflowId: executor.workflowId,
    scenario: executor.scenario,
    action: executor.action,
    route: executor.route,
    endpoint: executor.endpoint,
    method: executor.method,
    handler: executor.handler,
    status: executor.status,
    appRoute: surface.appRoute,
    appEndpoint: surface.appEndpoint,
    appMethod: surface.appMethod,
    appHandler: surface.appHandler,
    uiSurface: surface.uiSurface,
    routeResolved: true,
    endpointResolved: true,
  };
}

function deriveIntegrations(
  executors: readonly WorkflowExecutor[],
): WorkflowIntegration[] {
  return [...executors]
    .sort((a, b) => a.workflowId.localeCompare(b.workflowId))
    .map(integrateFromExecutor);
}

/**
 * Build read-only Workflow Integrations from EP-4 WP-6 executors.
 */
export function buildWorkflowIntegration(): WorkflowIntegration[] {
  const executors = getWorkflowExecutor();
  const out = sortStable(deriveIntegrations(executors)).map(cloneIntegration);
  cachedIntegrations = out.map(cloneIntegration);
  return cachedIntegrations.map(cloneIntegration);
}

/**
 * Get the last built integrations, or build if none cached.
 */
export function getWorkflowIntegration(): WorkflowIntegration[] {
  if (!cachedIntegrations) {
    return buildWorkflowIntegration();
  }
  return cachedIntegrations.map(cloneIntegration);
}

/** Resolve app surface for a scenario (deterministic lookup). */
export function resolveWorkflowAppSurface(
  scenario: WorkflowScenario,
): WorkflowAppSurface {
  return { ...SURFACE_BY_SCENARIO[scenario] };
}

/** Stable content fingerprint for determinism checks. */
export function workflowIntegrationFingerprint(
  rows?: readonly WorkflowIntegration[],
): string {
  const list = sortStable(rows ?? getWorkflowIntegration());
  return list
    .map(
      (r) =>
        `${r.workflowId}|${r.scenario}|${r.action}|${r.route}|${r.endpoint}|${r.method}|${r.handler}|${r.status}|${r.appRoute}|${r.appEndpoint}|${r.appMethod}|${r.appHandler}|${r.uiSurface}|${r.routeResolved}|${r.endpointResolved}`,
    )
    .join(";");
}

/** Test helper — clears integration cache only. */
export function clearWorkflowIntegration(): void {
  cachedIntegrations = null;
}
