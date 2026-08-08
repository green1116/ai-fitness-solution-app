/**
 * EP-4 / WP-2 — Application Workflow Definition
 * Deterministic read-only definitions derived from WorkflowContext (WP-1).
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1.
 */

import {
  EP_WORKFLOW_CONTEXT_BASELINE,
  getWorkflowContext,
  type WorkflowContext,
} from "./workflow-context";

export const EP_4_WP2_ID = "WP-2" as const;
export const WORKFLOW_DEFINITION_CAPABILITY = "WorkflowDefinition" as const;
export const EP_WORKFLOW_DEFINITION_VERSION =
  "ep-4-wp-2-workflow-definition-1" as const;
/** Reuses Pilot GA + EP-4 WP-1 baseline. */
export const EP_WORKFLOW_DEFINITION_BASELINE = EP_WORKFLOW_CONTEXT_BASELINE;

export const WORKFLOW_SCENARIOS = [
  "INTAKE",
  "EXECUTION",
  "REVIEW",
  "HANDOFF",
] as const;
export type WorkflowScenario = (typeof WORKFLOW_SCENARIOS)[number];

export const WORKFLOW_TRIGGERS = [
  "ON_CREATE",
  "ON_ASSIGN",
  "ON_COMPLETE",
  "ON_ESCALATE",
] as const;
export type WorkflowTrigger = (typeof WORKFLOW_TRIGGERS)[number];

export const WORKFLOW_ACTIONS = [
  "ROUTE_TASK",
  "NOTIFY",
  "APPROVE",
  "ARCHIVE",
] as const;
export type WorkflowAction = (typeof WORKFLOW_ACTIONS)[number];

export const WORKFLOW_DEFINITION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkflowDefinitionStatus =
  (typeof WORKFLOW_DEFINITION_STATUSES)[number];

export type WorkflowDefinition = Readonly<{
  workflowId: string;
  workflowKey: string;
  scenario: WorkflowScenario;
  trigger: WorkflowTrigger;
  action: WorkflowAction;
  route: string;
  status: WorkflowDefinitionStatus;
}>;

let cachedDefinitions: WorkflowDefinition[] | null = null;

function cloneDefinition(row: WorkflowDefinition): WorkflowDefinition {
  return { ...row };
}

function sortStable(
  rows: readonly WorkflowDefinition[],
): WorkflowDefinition[] {
  return [...rows].sort((a, b) => {
    const byId = a.workflowId.localeCompare(b.workflowId);
    if (byId !== 0) return byId;
    return a.workflowKey.localeCompare(b.workflowKey);
  });
}

function pickByIndex<T extends string>(
  values: readonly T[],
  index: number,
): T {
  return values[index % values.length]!;
}

function defineFromContext(
  ctx: WorkflowContext,
  index: number,
): WorkflowDefinition {
  const scenario = pickByIndex(WORKFLOW_SCENARIOS, index);
  const trigger = pickByIndex(WORKFLOW_TRIGGERS, index);
  const action = pickByIndex(WORKFLOW_ACTIONS, index);
  const workflowKey = `key.${ctx.workspaceId}.${scenario.toLowerCase()}`;
  const route = `/workflows/${ctx.organizationId}/${ctx.workspaceId}/${scenario.toLowerCase()}`;
  const status: WorkflowDefinitionStatus =
    ctx.status === "ACTIVE" ? "ACTIVE" : ctx.status;

  return {
    workflowId: ctx.workflowId,
    workflowKey,
    scenario,
    trigger,
    action,
    route,
    status,
  };
}

function deriveDefinitions(
  contexts: readonly WorkflowContext[],
): WorkflowDefinition[] {
  const sorted = [...contexts].sort((a, b) =>
    a.workflowId.localeCompare(b.workflowId),
  );
  return sorted.map((ctx, index) => defineFromContext(ctx, index));
}

/**
 * Build read-only Workflow Definitions from EP-4 WP-1 contexts.
 */
export function buildWorkflowDefinition(): WorkflowDefinition[] {
  const contexts = getWorkflowContext();
  const out = sortStable(deriveDefinitions(contexts)).map(cloneDefinition);
  cachedDefinitions = out.map(cloneDefinition);
  return cachedDefinitions.map(cloneDefinition);
}

/**
 * Get the last built definitions, or build if none cached.
 */
export function getWorkflowDefinition(): WorkflowDefinition[] {
  if (!cachedDefinitions) {
    return buildWorkflowDefinition();
  }
  return cachedDefinitions.map(cloneDefinition);
}

/** Stable content fingerprint for determinism checks. */
export function workflowDefinitionFingerprint(
  rows?: readonly WorkflowDefinition[],
): string {
  const list = sortStable(rows ?? getWorkflowDefinition());
  return list
    .map(
      (d) =>
        `${d.workflowId}|${d.workflowKey}|${d.scenario}|${d.trigger}|${d.action}|${d.route}|${d.status}`,
    )
    .join(";");
}

/** Test helper — clears definition cache only. */
export function clearWorkflowDefinition(): void {
  cachedDefinitions = null;
}
