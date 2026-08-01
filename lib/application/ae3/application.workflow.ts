/**
 * AE-3 — Application workflow plan over AE-2 runtime.
 * Workflow catalogue only — does not execute stages or invoke UI / integration.
 */
import { AE2_RUNTIME_ID } from "../ae2/application.runtime";
import { resolveApplicationRuntimePlan } from "../ae2/application.runtime";
import {
  APPLICATION_WORKFLOW_DEFINITION,
  AE3_BASE_FREEZE_REF,
  AE3_RUNTIME_REF,
  AE3_WORKFLOW_ID,
} from "./workflow.definition";
import {
  AE3_WORKFLOW_REGISTRY,
  type Ae3WorkflowRegistryEntry,
} from "./workflow.registry";
import {
  APPLICATION_WORKFLOW_POLICY,
  type ApplicationWorkflowPolicy,
} from "./workflow.policy";
import {
  AE3_DEFAULT_STAGE,
  AE3_STAGE_CHAIN,
  AE3_WORKFLOW_STAGES,
  getAe3WorkflowStage,
  type Ae3WorkflowStage,
  type Ae3WorkflowStageId,
} from "./workflow.stage";
import {
  AE3_WORKFLOW_TRANSITIONS,
  transitionsFrom,
  type Ae3WorkflowTransition,
} from "./workflow.transition";

export type ApplicationWorkflowPlan = Readonly<{
  workflowId: typeof AE3_WORKFLOW_ID;
  baseFreezeRef: typeof AE3_BASE_FREEZE_REF;
  definition: typeof APPLICATION_WORKFLOW_DEFINITION;
  registry: typeof AE3_WORKFLOW_REGISTRY;
  stage: Ae3WorkflowStage;
  stageId: Ae3WorkflowStageId;
  stages: typeof AE3_WORKFLOW_STAGES;
  stageChain: typeof AE3_STAGE_CHAIN;
  transitions: typeof AE3_WORKFLOW_TRANSITIONS;
  outbound: readonly Ae3WorkflowTransition[];
  policy: ApplicationWorkflowPolicy;
  matchesRuntime: boolean;
  workflowOnly: boolean;
}>;

/**
 * Resolve declarative AE-3 workflow plan bound to AE-2 runtime.
 */
export function resolveApplicationWorkflowPlan(
  stageId: Ae3WorkflowStageId = AE3_DEFAULT_STAGE,
): ApplicationWorkflowPlan {
  const runtime = resolveApplicationRuntimePlan();

  const stage =
    getAe3WorkflowStage(stageId) ??
    getAe3WorkflowStage(AE3_DEFAULT_STAGE)!;

  const matchesRuntime =
    AE3_RUNTIME_REF === AE2_RUNTIME_ID &&
    runtime.runtimeId === AE2_RUNTIME_ID &&
    runtime.matchesAssembly &&
    runtime.runtimeOnly &&
    APPLICATION_WORKFLOW_DEFINITION.runtimeRef === AE2_RUNTIME_ID;

  const workflowOnly =
    APPLICATION_WORKFLOW_POLICY.hasBusinessLogic === false &&
    APPLICATION_WORKFLOW_POLICY.hasIntegration === false &&
    APPLICATION_WORKFLOW_POLICY.hasDeployment === false &&
    APPLICATION_WORKFLOW_POLICY.hasUi === false &&
    APPLICATION_WORKFLOW_DEFINITION.nonGoals.includes("business-logic") &&
    APPLICATION_WORKFLOW_DEFINITION.nonGoals.includes("integration") &&
    APPLICATION_WORKFLOW_DEFINITION.nonGoals.includes("deployment") &&
    APPLICATION_WORKFLOW_DEFINITION.nonGoals.includes("ui");

  return {
    workflowId: AE3_WORKFLOW_ID,
    baseFreezeRef: AE3_BASE_FREEZE_REF,
    definition: APPLICATION_WORKFLOW_DEFINITION,
    registry: AE3_WORKFLOW_REGISTRY,
    stage,
    stageId: stage.stageId,
    stages: AE3_WORKFLOW_STAGES,
    stageChain: AE3_STAGE_CHAIN,
    transitions: AE3_WORKFLOW_TRANSITIONS,
    outbound: transitionsFrom(stage.stageId),
    policy: APPLICATION_WORKFLOW_POLICY,
    matchesRuntime,
    workflowOnly,
  };
}

export type { Ae3WorkflowRegistryEntry };
