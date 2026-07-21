/**
 * E11-P2 — Cloud Runtime Execution types
 */

import type { CloudMetadata } from "../types/cloud.types";
import {
  E11_EXECUTION_BASE,
  E11_EXECUTION_FREEZE_VERSION,
  E11_EXECUTION_ID,
  E11_EXECUTION_VERSION,
  EXECUTION_PRIORITIES,
  EXECUTION_RESULT_STATUSES,
  EXECUTION_TASK_KINDS,
  EXECUTION_TASK_STATUSES,
  EXECUTION_TRACE_EVENTS,
  EXECUTION_MANAGER_STATUSES,
} from "./execution.constants";

export type ExecutionTaskKind = (typeof EXECUTION_TASK_KINDS)[number];
export type ExecutionTaskStatus = (typeof EXECUTION_TASK_STATUSES)[number];
export type ExecutionResultStatus = (typeof EXECUTION_RESULT_STATUSES)[number];
export type ExecutionTraceEventType = (typeof EXECUTION_TRACE_EVENTS)[number];
export type ExecutionManagerStatus = (typeof EXECUTION_MANAGER_STATUSES)[number];
export type ExecutionPriority = (typeof EXECUTION_PRIORITIES)[number];

export type { CloudMetadata };

/** Execution task model. */
export type ExecutionTask = {
  id: string;
  name: string;
  kind: ExecutionTaskKind;
  status: ExecutionTaskStatus;
  priority: ExecutionPriority;
  runtimeId: string;
  contextId?: string;
  payload: CloudMetadata;
  metadata: CloudMetadata;
  createdAt: string;
  queuedAt?: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
};

export type CreateExecutionTaskInput = {
  id?: string;
  name: string;
  kind: ExecutionTaskKind;
  runtimeId: string;
  contextId?: string;
  priority?: ExecutionPriority;
  payload?: CloudMetadata;
  metadata?: CloudMetadata;
};

/** Execution result. */
export type ExecutionResult = {
  taskId: string;
  runtimeId: string;
  contextId?: string;
  status: ExecutionResultStatus;
  output: CloudMetadata;
  durationMs: number;
  error?: string;
  completedAt: string;
};

/** Trace event. */
export type ExecutionTraceEvent = {
  type: ExecutionTraceEventType;
  at: string;
  message: string;
  detail?: CloudMetadata;
};

/** Execution trace. */
export type ExecutionTrace = {
  taskId: string;
  runtimeId: string;
  events: ExecutionTraceEvent[];
  createdAt: string;
};

export type ExecutionBundle = {
  task: ExecutionTask;
  result: ExecutionResult;
  trace: ExecutionTrace;
};

export type ExecutionRegistryManifest = {
  executionId: typeof E11_EXECUTION_ID;
  version: typeof E11_EXECUTION_VERSION;
  freezeVersion: typeof E11_EXECUTION_FREEZE_VERSION;
  base: typeof E11_EXECUTION_BASE;
  taskCount: number;
  queuedCount: number;
  resultCount: number;
};
