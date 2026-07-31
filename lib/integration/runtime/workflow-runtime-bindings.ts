/**
 * PI-5.3 — Workflow → runtime execution bias (PD-6.3).
 * Reuses PI-5.2 WF-* catalogue; no new workflow families.
 */
import type { IntegrationPointId } from "../foundation/integration-points";
import type { IntegrationWorkflowId } from "../routing/workflow-kinds";
import { STAGE_DEFAULT_POINTS } from "../routing/stage-routing";

export type WorkflowRuntimeMode =
  | "http-query"
  | "http-command"
  | "http-async"
  | "client-nav"
  | "error-propagate"
  | "recover";

export type WorkflowRuntimeBinding = Readonly<{
  workflowId: IntegrationWorkflowId;
  mode: WorkflowRuntimeMode;
  /** Required seam points (subset of PI-5.1 INTP-*). */
  requiredPointIds: readonly IntegrationPointId[];
  notes: string;
}>;

const HTTP_CORE: readonly IntegrationPointId[] = [
  ...STAGE_DEFAULT_POINTS.UI,
  ...STAGE_DEFAULT_POINTS.API,
  ...STAGE_DEFAULT_POINTS.SERVICE,
  ...STAGE_DEFAULT_POINTS.DOMAIN,
  ...STAGE_DEFAULT_POINTS.PERSISTENCE,
];

export const WORKFLOW_RUNTIME_BINDINGS = [
  {
    workflowId: "WF-READ",
    mode: "http-query",
    requiredPointIds: HTTP_CORE,
    notes: "Sync read through full pipeline",
  },
  {
    workflowId: "WF-COMMAND",
    mode: "http-command",
    requiredPointIds: HTTP_CORE,
    notes: "Sync command through full pipeline",
  },
  {
    workflowId: "WF-ASYNC",
    mode: "http-async",
    requiredPointIds: HTTP_CORE,
    notes: "Async job start/status via existing seams",
  },
  {
    workflowId: "WF-NAV",
    mode: "client-nav",
    requiredPointIds: ["INTP-FE-ADAPTER"],
    notes: "Client navigation only",
  },
  {
    workflowId: "WF-FAIL",
    mode: "error-propagate",
    requiredPointIds: ["INTP-FE-ADAPTER", "INTP-API-SURFACE"],
    notes: "Safe error envelope → FE META",
  },
  {
    workflowId: "WF-RECOVER",
    mode: "recover",
    requiredPointIds: ["INTP-FE-ADAPTER", "INTP-API-SURFACE"],
    notes: "Re-auth / retry / safe NAV",
  },
] as const satisfies readonly WorkflowRuntimeBinding[];

export function getWorkflowRuntimeBinding(
  workflowId: IntegrationWorkflowId,
): WorkflowRuntimeBinding | undefined {
  return WORKFLOW_RUNTIME_BINDINGS.find((row) => row.workflowId === workflowId);
}
