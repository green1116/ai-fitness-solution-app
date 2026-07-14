/**
 * E04-P3 — Business Process Orchestration types
 * Process layer above E04 Workflow Runtime
 */

import {
  E04_PROCESS_BASE,
  E04_PROCESS_FREEZE_VERSION,
  E04_PROCESS_ORCHESTRATION_ID,
  E04_PROCESS_VERSION,
  PROCESS_INSTANCE_PHASES,
  PROCESS_NODE_STATUSES,
} from "./process.constants";

export type ProcessInstancePhase = (typeof PROCESS_INSTANCE_PHASES)[number];
export type ProcessNodeStatus = (typeof PROCESS_NODE_STATUSES)[number];

export type ProcessNodeDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E04 workflow id */
  workflowId: string;
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type ProcessEdge = {
  from: string;
  to: string;
  readOnly: true;
};

export type ProcessDefinition = {
  id: string;
  name: string;
  description: string;
  nodes: ProcessNodeDefinition[];
  optional: boolean;
  readOnly: true;
};

export type ProcessGraph = {
  processId: string;
  nodes: string[];
  edges: ProcessEdge[];
  order: string[];
  acyclic: boolean;
  readOnly: true;
};

export type ProcessNodeRuntimeState = {
  nodeId: string;
  workflowId: string;
  status: ProcessNodeStatus;
  startedAt?: string;
  finishedAt?: string;
  workflowInstanceId?: string;
  output?: Readonly<Record<string, unknown>>;
  errorMessage?: string;
  readOnly: true;
};

export type ProcessInstanceTransition = {
  from: ProcessInstancePhase;
  to: ProcessInstancePhase;
  at: string;
  note?: string;
  readOnly: true;
};

export type ProcessInstanceState = {
  phase: ProcessInstancePhase;
  phases: ProcessInstancePhase[];
  transitions: ProcessInstanceTransition[];
  nodes: ProcessNodeRuntimeState[];
  complete: boolean;
  readOnly: true;
};

export type ProcessInstance = {
  instanceId: string;
  processId: string;
  taskId: string;
  input: Readonly<Record<string, unknown>>;
  metadata: Readonly<Record<string, string>>;
  state: ProcessInstanceState;
  createdAt: string;
  readOnly: true;
};

export type ProcessRegistryManifest = {
  orchestrationId: typeof E04_PROCESS_ORCHESTRATION_ID;
  version: typeof E04_PROCESS_VERSION;
  freezeVersion: typeof E04_PROCESS_FREEZE_VERSION;
  base: typeof E04_PROCESS_BASE;
  processCount: number;
  processes: ProcessDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type ProcessExecutionResult = {
  success: boolean;
  processId: string;
  instanceId: string;
  taskId: string;
  output: Readonly<Record<string, unknown>>;
  nodeOutputs: ReadonlyArray<{
    nodeId: string;
    workflowId: string;
    workflowInstanceId: string;
    output: Readonly<Record<string, unknown>>;
  }>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};
