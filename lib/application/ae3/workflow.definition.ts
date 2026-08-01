/**
 * AE-3 — Application workflow definition.
 * Workflow catalogue over AE-2 runtime — invents no business / integration / UI / deployment.
 */
import {
  AE2_MODULE_PATH,
  AE2_PACKAGE_ID,
  AE2_RUNTIME_ID,
} from "../ae2/application.runtime";

export const AE3_WORKFLOW_ID = "application-workflow-ae3-v1" as const;

export const AE3_WORKFLOW_GATE = "application-workflow-ae3-gate" as const;

export const AE3_PACKAGE_ID = "AE-3" as const;

/** Frozen base — AE-2 Application Runtime. */
export const AE3_BASE_FREEZE_REF = "ae-2-application-runtime-v1" as const;

export const AE3_RUNTIME_REF = AE2_RUNTIME_ID;

export const AE3_RUNTIME_PACKAGE_REF = AE2_PACKAGE_ID;

export const AE3_RUNTIME_MODULE_REF = AE2_MODULE_PATH;

export const AE3_MODULE_PATH = "lib/application/ae3" as const;

export const AE3_PURPOSE =
  "Declare application workflow stages and transitions over AE-2 runtime" as const;

export const AE3_NON_GOALS = [
  "business-logic",
  "integration",
  "deployment",
  "ui",
  "product-definition-redesign",
  "governance-redesign",
  "pi-redesign",
  "ae1-redesign",
  "ae2-redesign",
  "new-architecture",
] as const;

export type Ae3NonGoal = (typeof AE3_NON_GOALS)[number];

export type ApplicationWorkflowDefinition = Readonly<{
  workflowId: typeof AE3_WORKFLOW_ID;
  packageId: typeof AE3_PACKAGE_ID;
  baseFreezeRef: typeof AE3_BASE_FREEZE_REF;
  runtimeRef: typeof AE3_RUNTIME_REF;
  purpose: typeof AE3_PURPOSE;
  nonGoals: readonly Ae3NonGoal[];
  modulePath: typeof AE3_MODULE_PATH;
}>;

export const APPLICATION_WORKFLOW_DEFINITION = {
  workflowId: AE3_WORKFLOW_ID,
  packageId: AE3_PACKAGE_ID,
  baseFreezeRef: AE3_BASE_FREEZE_REF,
  runtimeRef: AE3_RUNTIME_REF,
  purpose: AE3_PURPOSE,
  nonGoals: AE3_NON_GOALS,
  modulePath: AE3_MODULE_PATH,
} as const satisfies ApplicationWorkflowDefinition;
