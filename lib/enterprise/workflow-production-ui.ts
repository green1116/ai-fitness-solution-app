/**
 * EP-4 / WP-9 — Production UI Integration
 * Binds WorkflowEntryPanel (WP-8) into existing production host routes.
 * Reuses existing routes / APIs / handlers / UI. No mocks. No new registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-4 WP-1~WP-8.
 */

import {
  EP_WORKFLOW_ENTRY_PANEL_BASELINE,
  getWorkflowEntryPanel,
  type WorkflowEntryPanel,
  type WorkflowEntryPanelStatus,
} from "./workflow-entry-panel";
import type { WorkflowScenario } from "./workflow-definition";

export const EP_4_WP9_ID = "WP-9" as const;
export const WORKFLOW_PRODUCTION_UI_CAPABILITY =
  "WorkflowProductionUi" as const;
export const EP_WORKFLOW_PRODUCTION_UI_VERSION =
  "ep-4-wp-9-workflow-production-ui-1" as const;
/** Reuses Pilot GA + EP-4 WP-1~WP-8 baseline. */
export const EP_WORKFLOW_PRODUCTION_UI_BASELINE =
  EP_WORKFLOW_ENTRY_PANEL_BASELINE;

export const WORKFLOW_PRODUCTION_HOSTS = [
  "/pilot/intake",
  "/dashboard/command-center",
] as const;
export type WorkflowProductionHost =
  (typeof WORKFLOW_PRODUCTION_HOSTS)[number];

export type WorkflowProductionSurfaceProof = Readonly<{
  pageFile: string;
  apiRouteFile: string;
  handlerFile: string;
  uiFile: string;
}>;

/**
 * Deterministic map from entry-panel fields onto real production artifacts.
 * Handoff endpoint is the logical key; the App Router file uses [sessionId].
 */
export const WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO: Readonly<
  Record<WorkflowScenario, WorkflowProductionSurfaceProof>
> = {
  INTAKE: {
    pageFile: "app/(pilot)/pilot/intake/page.tsx",
    apiRouteFile: "app/api/pilot/v80/intake/upload/route.ts",
    handlerFile: "lib/pilot/v80/intake/upload.service.ts",
    uiFile: "components/pilot/IntakeReviewEditor.tsx",
  },
  EXECUTION: {
    pageFile: "app/dashboard/command-center/page.tsx",
    apiRouteFile: "app/api/operations/command/dispatch/route.ts",
    handlerFile: "lib/operations/command/api/handlers.ts",
    uiFile: "components/pilot/IntakeOpsDashboard.tsx",
  },
  REVIEW: {
    pageFile: "app/(pilot)/pilot/intake/page.tsx",
    apiRouteFile: "app/api/pilot/v80/intake/approve/route.ts",
    handlerFile: "lib/pilot/v80/intake/approve.service.ts",
    uiFile: "components/pilot/IntakeSignoffPanel.tsx",
  },
  HANDOFF: {
    pageFile: "app/(pilot)/pilot/intake/page.tsx",
    apiRouteFile:
      "app/api/pilot/v80/intake/[sessionId]/handoff-package/route.ts",
    handlerFile: "lib/pilot/v80/intake/handoff-package.service.ts",
    uiFile: "components/pilot/IntakeHandoffPackagePanel.tsx",
  },
};

export type WorkflowProductionUiAction = Readonly<{
  workflowId: string;
  scenario: WorkflowScenario;
  hostRoute: WorkflowProductionHost;
  route: string;
  endpoint: string;
  handler: string;
  uiComponent: string;
  status: WorkflowEntryPanelStatus;
  actionVisible: true;
  mocked: false;
  pageFile: string;
  apiRouteFile: string;
  handlerFile: string;
  uiFile: string;
}>;

let cachedActions: WorkflowProductionUiAction[] | null = null;

function cloneAction(
  row: WorkflowProductionUiAction,
): WorkflowProductionUiAction {
  return { ...row };
}

function sortStable(
  rows: readonly WorkflowProductionUiAction[],
): WorkflowProductionUiAction[] {
  return [...rows].sort((a, b) => {
    const byHost = a.hostRoute.localeCompare(b.hostRoute);
    if (byHost !== 0) return byHost;
    const byId = a.workflowId.localeCompare(b.workflowId);
    if (byId !== 0) return byId;
    return a.scenario.localeCompare(b.scenario);
  });
}

function isProductionHost(route: string): route is WorkflowProductionHost {
  return (WORKFLOW_PRODUCTION_HOSTS as readonly string[]).includes(route);
}

function actionFromPanel(
  panel: WorkflowEntryPanel,
): WorkflowProductionUiAction | null {
  if (!isProductionHost(panel.route)) return null;
  const proof = WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[panel.scenario];
  return {
    workflowId: panel.workflowId,
    scenario: panel.scenario,
    hostRoute: panel.route,
    route: panel.route,
    endpoint: panel.endpoint,
    handler: panel.handler,
    uiComponent: panel.uiComponent,
    status: panel.status,
    actionVisible: true,
    mocked: false,
    pageFile: proof.pageFile,
    apiRouteFile: proof.apiRouteFile,
    handlerFile: proof.handlerFile,
    uiFile: proof.uiFile,
  };
}

function deriveActions(
  panels: readonly WorkflowEntryPanel[],
): WorkflowProductionUiAction[] {
  const out: WorkflowProductionUiAction[] = [];
  const sorted = [...panels].sort((a, b) =>
    a.workflowId.localeCompare(b.workflowId),
  );
  for (const panel of sorted) {
    const action = actionFromPanel(panel);
    if (action) out.push(action);
  }
  return out;
}

/**
 * Build read-only production UI actions from EP-4 WP-8 entry panels.
 */
export function buildWorkflowProductionUi(): WorkflowProductionUiAction[] {
  const panels = getWorkflowEntryPanel();
  const out = sortStable(deriveActions(panels)).map(cloneAction);
  cachedActions = out.map(cloneAction);
  return cachedActions.map(cloneAction);
}

/**
 * Get the last built production UI actions, or build if none cached.
 */
export function getWorkflowProductionUi(): WorkflowProductionUiAction[] {
  if (!cachedActions) {
    return buildWorkflowProductionUi();
  }
  return cachedActions.map(cloneAction);
}

/** Actions bound to a specific production host route. */
export function getWorkflowProductionUiForHost(
  host: WorkflowProductionHost,
): WorkflowProductionUiAction[] {
  return getWorkflowProductionUi().filter((a) => a.hostRoute === host);
}

/** Resolve real artifact paths for a scenario. */
export function resolveWorkflowProductionSurface(
  scenario: WorkflowScenario,
): WorkflowProductionSurfaceProof {
  return { ...WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[scenario] };
}

/** Stable content fingerprint for determinism checks. */
export function workflowProductionUiFingerprint(
  rows?: readonly WorkflowProductionUiAction[],
): string {
  const list = sortStable(rows ?? getWorkflowProductionUi());
  return list
    .map(
      (a) =>
        `${a.workflowId}|${a.scenario}|${a.hostRoute}|${a.route}|${a.endpoint}|${a.handler}|${a.uiComponent}|${a.status}|${a.actionVisible}|${a.mocked}|${a.pageFile}|${a.apiRouteFile}|${a.handlerFile}|${a.uiFile}`,
    )
    .join(";");
}

/** Test helper — clears production UI cache only. */
export function clearWorkflowProductionUi(): void {
  cachedActions = null;
}
