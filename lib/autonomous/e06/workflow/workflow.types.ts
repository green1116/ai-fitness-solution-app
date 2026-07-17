/**
 * E06-P3 — Autonomous Workflow Agent types
 * Workflow layer above E06 Business Action Runtime
 */

import type { ActionExecutionResult } from "../action/action.types";
import {
  E06_WORKFLOW_AGENT_ID,
  E06_WORKFLOW_BASE,
  E06_WORKFLOW_FREEZE_VERSION,
  E06_WORKFLOW_VERSION,
  WORKFLOW_GOAL_KINDS,
  WORKFLOW_INSTANCE_PHASES,
} from "./workflow.constants";

export type WorkflowGoalKind = (typeof WORKFLOW_GOAL_KINDS)[number];
export type WorkflowInstancePhase =
  (typeof WORKFLOW_INSTANCE_PHASES)[number];

export type WorkflowDefinition = {
  id: string;
  name: string;
  goalKind: WorkflowGoalKind;
  goal: string;
  description: string;
  /** Ordered E06 action ids executed as the workflow sequence */
  actionIds: string[];
  optional: boolean;
  readOnly: true;
};

export type WorkflowPlanStep = {
  id: string;
  order: number;
  actionId: string;
  actionKind: string;
  operationId: string;
  title: string;
  detail: string;
  readOnly: true;
};

export type WorkflowPlan = {
  workflowId: string;
  goalKind: WorkflowGoalKind;
  goal: string;
  stepCount: number;
  steps: WorkflowPlanStep[];
  narrative: string;
  readOnly: true;
};

export type WorkflowStepResult = {
  stepId: string;
  order: number;
  actionId: string;
  success: boolean;
  status: ActionExecutionResult["status"];
  effect?: string;
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type WorkflowExecutionResult = {
  success: boolean;
  workflowId: string;
  goalKind: WorkflowGoalKind;
  goal: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  plan: WorkflowPlan;
  stepResults: WorkflowStepResult[];
  completedSteps: number;
  effects: string[];
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type WorkflowRegistryManifest = {
  agentId: typeof E06_WORKFLOW_AGENT_ID;
  version: typeof E06_WORKFLOW_VERSION;
  freezeVersion: typeof E06_WORKFLOW_FREEZE_VERSION;
  base: typeof E06_WORKFLOW_BASE;
  workflowCount: number;
  goalKinds: WorkflowGoalKind[];
  workflows: WorkflowDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
