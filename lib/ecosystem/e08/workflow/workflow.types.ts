/**
 * E08-P4 — Cross Enterprise Workflow types
 * Workflow layer above E08 AI Partner Exchange
 */

import type { PartnerExchangeResult } from "../exchange/exchange.types";
import {
  E08_WORKFLOW_BASE,
  E08_WORKFLOW_FREEZE_VERSION,
  E08_WORKFLOW_ID,
  E08_WORKFLOW_VERSION,
  WORKFLOW_INSTANCE_PHASES,
  WORKFLOW_KINDS,
} from "./workflow.constants";

export type WorkflowKind = (typeof WORKFLOW_KINDS)[number];
export type WorkflowInstancePhase =
  (typeof WORKFLOW_INSTANCE_PHASES)[number];

export type WorkflowDefinition = {
  id: string;
  name: string;
  kind: WorkflowKind;
  goal: string;
  description: string;
  /** Ordered E08 partner-exchange listing ids */
  listingIds: string[];
  optional: boolean;
  readOnly: true;
};

export type WorkflowPlanStep = {
  id: string;
  order: number;
  listingId: string;
  exchangeCategory: string;
  networkId: string;
  title: string;
  detail: string;
  readOnly: true;
};

export type WorkflowPlan = {
  workflowId: string;
  kind: WorkflowKind;
  goal: string;
  stepCount: number;
  steps: WorkflowPlanStep[];
  narrative: string;
  readOnly: true;
};

export type WorkflowStepResult = {
  stepId: string;
  order: number;
  listingId: string;
  success: boolean;
  status: PartnerExchangeResult["status"];
  completedNodes: number;
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type WorkflowExecutionResult = {
  success: boolean;
  workflowId: string;
  kind: WorkflowKind;
  goal: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  plan: WorkflowPlan;
  stepResults: WorkflowStepResult[];
  completedSteps: number;
  exchangedListings: string[];
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type WorkflowRegistryManifest = {
  workflowId: typeof E08_WORKFLOW_ID;
  version: typeof E08_WORKFLOW_VERSION;
  freezeVersion: typeof E08_WORKFLOW_FREEZE_VERSION;
  base: typeof E08_WORKFLOW_BASE;
  workflowCount: number;
  kinds: WorkflowKind[];
  workflows: WorkflowDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
