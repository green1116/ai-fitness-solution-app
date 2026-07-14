/**
 * E04-P2 — Business Workflow Runtime types
 * Workflow layer above E04 Business Agent Foundation
 */

import {
  E04_WORKFLOW_BASE,
  E04_WORKFLOW_FREEZE_VERSION,
  E04_WORKFLOW_RUNTIME_ID,
  E04_WORKFLOW_VERSION,
  WORKFLOW_INSTANCE_PHASES,
  WORKFLOW_STEP_STATUSES,
  WORKFLOW_TRACE_EVENT_KINDS,
} from "./workflow.constants";

export type WorkflowInstancePhase =
  (typeof WORKFLOW_INSTANCE_PHASES)[number];
export type WorkflowStepStatus = (typeof WORKFLOW_STEP_STATUSES)[number];
export type WorkflowTraceEventKind =
  (typeof WORKFLOW_TRACE_EVENT_KINDS)[number];

export type WorkflowStepDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E04 business agent id */
  businessAgentId: string;
  capabilityId?: string;
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStepDefinition[];
  optional: boolean;
  readOnly: true;
};

export type WorkflowStepRuntimeState = {
  stepId: string;
  status: WorkflowStepStatus;
  businessAgentId: string;
  capabilityId?: string;
  startedAt?: string;
  finishedAt?: string;
  output?: Readonly<Record<string, unknown>>;
  errorMessage?: string;
  readOnly: true;
};

export type WorkflowInstanceTransition = {
  from: WorkflowInstancePhase;
  to: WorkflowInstancePhase;
  at: string;
  note?: string;
  readOnly: true;
};

export type WorkflowInstanceState = {
  phase: WorkflowInstancePhase;
  phases: WorkflowInstancePhase[];
  transitions: WorkflowInstanceTransition[];
  steps: WorkflowStepRuntimeState[];
  complete: boolean;
  readOnly: true;
};

export type WorkflowInstance = {
  instanceId: string;
  workflowId: string;
  taskId: string;
  input: Readonly<Record<string, unknown>>;
  metadata: Readonly<Record<string, string>>;
  state: WorkflowInstanceState;
  createdAt: string;
  readOnly: true;
};

export type WorkflowRegistryManifest = {
  runtimeId: typeof E04_WORKFLOW_RUNTIME_ID;
  version: typeof E04_WORKFLOW_VERSION;
  freezeVersion: typeof E04_WORKFLOW_FREEZE_VERSION;
  base: typeof E04_WORKFLOW_BASE;
  workflowCount: number;
  workflows: WorkflowDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type WorkflowExecutionResult = {
  success: boolean;
  workflowId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  output: Readonly<Record<string, unknown>>;
  stepOutputs: ReadonlyArray<{
    stepId: string;
    businessAgentId: string;
    output: Readonly<Record<string, unknown>>;
  }>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};
