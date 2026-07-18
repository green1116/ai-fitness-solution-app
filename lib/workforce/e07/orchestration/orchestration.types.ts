/**
 * E07-P4 — Workforce Orchestration types
 * Multi-employee orchestration above E07 Role Agent Marketplace
 */

import type { RoleDeploymentResult } from "../marketplace/role.types";
import {
  E07_ORCHESTRATION_BASE,
  E07_ORCHESTRATION_FREEZE_VERSION,
  E07_ORCHESTRATION_ID,
  E07_ORCHESTRATION_VERSION,
  ORCHESTRATION_INSTANCE_PHASES,
  ORCHESTRATION_KINDS,
} from "./orchestration.constants";

export type OrchestrationKind = (typeof ORCHESTRATION_KINDS)[number];
export type OrchestrationInstancePhase =
  (typeof ORCHESTRATION_INSTANCE_PHASES)[number];

export type OrchestrationDefinition = {
  id: string;
  name: string;
  kind: OrchestrationKind;
  goal: string;
  description: string;
  /** Ordered marketplace role ids deployed as the orchestration sequence */
  roleIds: string[];
  optional: boolean;
  readOnly: true;
};

export type OrchestrationPlanStep = {
  id: string;
  order: number;
  roleId: string;
  roleCategory: string;
  employeeId: string;
  title: string;
  detail: string;
  readOnly: true;
};

export type OrchestrationPlan = {
  orchestrationId: string;
  kind: OrchestrationKind;
  goal: string;
  stepCount: number;
  steps: OrchestrationPlanStep[];
  narrative: string;
  readOnly: true;
};

export type OrchestrationStepResult = {
  stepId: string;
  order: number;
  roleId: string;
  success: boolean;
  status: RoleDeploymentResult["status"];
  completedTasks: number;
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type OrchestrationExecutionResult = {
  success: boolean;
  orchestrationId: string;
  kind: OrchestrationKind;
  goal: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  plan: OrchestrationPlan;
  stepResults: OrchestrationStepResult[];
  completedSteps: number;
  deployedRoles: string[];
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type OrchestrationRegistryManifest = {
  orchestrationId: typeof E07_ORCHESTRATION_ID;
  version: typeof E07_ORCHESTRATION_VERSION;
  freezeVersion: typeof E07_ORCHESTRATION_FREEZE_VERSION;
  base: typeof E07_ORCHESTRATION_BASE;
  orchestrationCount: number;
  kinds: OrchestrationKind[];
  orchestrations: OrchestrationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
