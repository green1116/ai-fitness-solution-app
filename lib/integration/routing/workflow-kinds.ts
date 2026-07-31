/**
 * PI-5.2 — Integration workflow kinds (PD-6.3 §1.1).
 * Closed set — no new workflow families.
 */
export const INTEGRATION_WORKFLOW_IDS = [
  "WF-READ",
  "WF-COMMAND",
  "WF-ASYNC",
  "WF-NAV",
  "WF-FAIL",
  "WF-RECOVER",
] as const;

export type IntegrationWorkflowId =
  (typeof INTEGRATION_WORKFLOW_IDS)[number];

export type WorkflowKindRecord = Readonly<{
  workflowId: IntegrationWorkflowId;
  kind: string;
  meaning: string;
  traversesHttp: boolean;
}>;

export const INTEGRATION_WORKFLOW_CATALOGUE = [
  {
    workflowId: "WF-READ",
    kind: "Sync read",
    meaning: "Query existing API → Domain read → ST-SERVER",
    traversesHttp: true,
  },
  {
    workflowId: "WF-COMMAND",
    kind: "Sync command",
    meaning: "Mutating/side-effect Command → Domain accept",
    traversesHttp: true,
  },
  {
    workflowId: "WF-ASYNC",
    kind: "Async job",
    meaning: "Command starts job; status via existing job/status surfaces",
    traversesHttp: true,
  },
  {
    workflowId: "WF-NAV",
    kind: "Client nav",
    meaning: "NAV / API+NAV edge after success",
    traversesHttp: false,
  },
  {
    workflowId: "WF-FAIL",
    kind: "Failure",
    meaning: "Typed error propagation",
    traversesHttp: false,
  },
  {
    workflowId: "WF-RECOVER",
    kind: "Recovery",
    meaning: "Re-auth, retry, safe NAV, job reconcile",
    traversesHttp: false,
  },
] as const satisfies readonly WorkflowKindRecord[];
