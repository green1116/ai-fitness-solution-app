/**
 * EP-4 / WP-8 — Workflow Entry Panel
 * Deterministic read-only entry panel descriptors derived from WorkflowIntegration (WP-7).
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1~WP-7.
 */

import {
  EP_WORKFLOW_INTEGRATION_BASELINE,
  getWorkflowIntegration,
  type WorkflowIntegration,
  type WorkflowIntegrationStatus,
} from "./workflow-integration";
import type { WorkflowScenario } from "./workflow-definition";

export const EP_4_WP8_ID = "WP-8" as const;
export const WORKFLOW_ENTRY_PANEL_CAPABILITY = "WorkflowEntryPanel" as const;
export const EP_WORKFLOW_ENTRY_PANEL_VERSION =
  "ep-4-wp-8-workflow-entry-panel-1" as const;
/** Reuses Pilot GA + EP-4 WP-1~WP-7 baseline. */
export const EP_WORKFLOW_ENTRY_PANEL_BASELINE =
  EP_WORKFLOW_INTEGRATION_BASELINE;

export type WorkflowEntryPanelStatus = WorkflowIntegrationStatus;

export type WorkflowEntryPanel = Readonly<{
  workflowId: string;
  scenario: WorkflowScenario;
  route: string;
  endpoint: string;
  handler: string;
  uiComponent: string;
  status: WorkflowEntryPanelStatus;
}>;

let cachedPanels: WorkflowEntryPanel[] | null = null;

function clonePanel(row: WorkflowEntryPanel): WorkflowEntryPanel {
  return { ...row };
}

function sortStable(
  rows: readonly WorkflowEntryPanel[],
): WorkflowEntryPanel[] {
  return [...rows].sort((a, b) => {
    const byId = a.workflowId.localeCompare(b.workflowId);
    if (byId !== 0) return byId;
    return a.scenario.localeCompare(b.scenario);
  });
}

function panelFromIntegration(
  integration: WorkflowIntegration,
): WorkflowEntryPanel {
  return {
    workflowId: integration.workflowId,
    scenario: integration.scenario,
    route: integration.appRoute,
    endpoint: integration.appEndpoint,
    handler: integration.appHandler,
    uiComponent: integration.uiSurface,
    status: integration.status,
  };
}

function derivePanels(
  integrations: readonly WorkflowIntegration[],
): WorkflowEntryPanel[] {
  return [...integrations]
    .sort((a, b) => a.workflowId.localeCompare(b.workflowId))
    .map(panelFromIntegration);
}

/**
 * Build read-only Workflow Entry Panels from EP-4 WP-7 integrations.
 */
export function buildWorkflowEntryPanel(): WorkflowEntryPanel[] {
  const integrations = getWorkflowIntegration();
  const out = sortStable(derivePanels(integrations)).map(clonePanel);
  cachedPanels = out.map(clonePanel);
  return cachedPanels.map(clonePanel);
}

/**
 * Get the last built panels, or build if none cached.
 */
export function getWorkflowEntryPanel(): WorkflowEntryPanel[] {
  if (!cachedPanels) {
    return buildWorkflowEntryPanel();
  }
  return cachedPanels.map(clonePanel);
}

/** Stable content fingerprint for determinism checks. */
export function workflowEntryPanelFingerprint(
  rows?: readonly WorkflowEntryPanel[],
): string {
  const list = sortStable(rows ?? getWorkflowEntryPanel());
  return list
    .map(
      (p) =>
        `${p.workflowId}|${p.scenario}|${p.route}|${p.endpoint}|${p.handler}|${p.uiComponent}|${p.status}`,
    )
    .join(";");
}

/** Test helper — clears entry panel cache only. */
export function clearWorkflowEntryPanel(): void {
  cachedPanels = null;
}
