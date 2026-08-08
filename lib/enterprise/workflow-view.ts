/**
 * EP-4 / WP-3 — Application Workflow View
 * Deterministic read-only views derived from WorkflowDefinition (WP-2).
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1~WP-2.
 */

import {
  EP_WORKFLOW_DEFINITION_BASELINE,
  getWorkflowDefinition,
  WORKFLOW_ACTIONS,
  WORKFLOW_SCENARIOS,
  type WorkflowAction,
  type WorkflowDefinition,
  type WorkflowDefinitionStatus,
  type WorkflowScenario,
} from "./workflow-definition";

export const EP_4_WP3_ID = "WP-3" as const;
export const WORKFLOW_VIEW_CAPABILITY = "WorkflowView" as const;
export const EP_WORKFLOW_VIEW_VERSION = "ep-4-wp-3-workflow-view-1" as const;
/** Reuses Pilot GA + EP-4 WP-1~WP-2 baseline. */
export const EP_WORKFLOW_VIEW_BASELINE = EP_WORKFLOW_DEFINITION_BASELINE;

export type WorkflowViewStatus = WorkflowDefinitionStatus;

export type WorkflowView = Readonly<{
  workflowId: string;
  scenario: WorkflowScenario;
  action: WorkflowAction;
  route: string;
  status: WorkflowViewStatus;
  availableActions: readonly WorkflowAction[];
  nextRoute: string;
}>;

let cachedViews: WorkflowView[] | null = null;

function cloneView(row: WorkflowView): WorkflowView {
  return {
    ...row,
    availableActions: [...row.availableActions],
  };
}

function sortStable(rows: readonly WorkflowView[]): WorkflowView[] {
  return [...rows].sort((a, b) => a.workflowId.localeCompare(b.workflowId));
}

function availableActionsFor(
  scenario: WorkflowScenario,
  action: WorkflowAction,
): WorkflowAction[] {
  const scenarioIndex = WORKFLOW_SCENARIOS.indexOf(scenario);
  const actionIndex = WORKFLOW_ACTIONS.indexOf(action);
  const primary = WORKFLOW_ACTIONS[(actionIndex + 1) % WORKFLOW_ACTIONS.length]!;
  const secondary =
    WORKFLOW_ACTIONS[(scenarioIndex + actionIndex) % WORKFLOW_ACTIONS.length]!;
  const tertiary = action;
  const unique = [...new Set([primary, secondary, tertiary])];
  return unique.sort((a, b) => a.localeCompare(b));
}

function nextRouteFor(definition: WorkflowDefinition): string {
  const scenarioIndex = WORKFLOW_SCENARIOS.indexOf(definition.scenario);
  const nextScenario =
    WORKFLOW_SCENARIOS[(scenarioIndex + 1) % WORKFLOW_SCENARIOS.length]!;
  const base = definition.route.replace(/\/[^/]+$/, "");
  return `${base}/${nextScenario.toLowerCase()}`;
}

function viewFromDefinition(definition: WorkflowDefinition): WorkflowView {
  return {
    workflowId: definition.workflowId,
    scenario: definition.scenario,
    action: definition.action,
    route: definition.route,
    status: definition.status,
    availableActions: availableActionsFor(
      definition.scenario,
      definition.action,
    ),
    nextRoute: nextRouteFor(definition),
  };
}

function deriveViews(
  definitions: readonly WorkflowDefinition[],
): WorkflowView[] {
  return [...definitions]
    .sort((a, b) => a.workflowId.localeCompare(b.workflowId))
    .map(viewFromDefinition);
}

/**
 * Build read-only Workflow Views from EP-4 WP-2 definitions.
 */
export function buildWorkflowView(): WorkflowView[] {
  const definitions = getWorkflowDefinition();
  const out = sortStable(deriveViews(definitions)).map(cloneView);
  cachedViews = out.map(cloneView);
  return cachedViews.map(cloneView);
}

/**
 * Get the last built views, or build if none cached.
 */
export function getWorkflowView(): WorkflowView[] {
  if (!cachedViews) {
    return buildWorkflowView();
  }
  return cachedViews.map(cloneView);
}

/** Stable content fingerprint for determinism checks. */
export function workflowViewFingerprint(
  rows?: readonly WorkflowView[],
): string {
  const list = sortStable(rows ?? getWorkflowView());
  return list
    .map((v) => {
      const actions = [...v.availableActions].sort().join(",");
      return `${v.workflowId}|${v.scenario}|${v.action}|${v.route}|${v.status}|${actions}|${v.nextRoute}`;
    })
    .join(";");
}

/** Test helper — clears view cache only. */
export function clearWorkflowView(): void {
  cachedViews = null;
}
