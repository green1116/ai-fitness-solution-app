/**
 * AE-4 — Application integration definition.
 * Integration catalogue over AE-3 workflow — invents no business / deployment / monitoring.
 */
import {
  AE3_MODULE_PATH,
  AE3_PACKAGE_ID,
  AE3_WORKFLOW_ID,
} from "../ae3/workflow.definition";

export const AE4_INTEGRATION_ID = "application-integration-ae4-v1" as const;

export const AE4_INTEGRATION_GATE =
  "application-integration-ae4-gate" as const;

export const AE4_PACKAGE_ID = "AE-4" as const;

/** Frozen base — AE-3 Application Workflow. */
export const AE4_BASE_FREEZE_REF = "ae-3-application-workflow-v1" as const;

export const AE4_WORKFLOW_REF = AE3_WORKFLOW_ID;

export const AE4_WORKFLOW_PACKAGE_REF = AE3_PACKAGE_ID;

export const AE4_WORKFLOW_MODULE_REF = AE3_MODULE_PATH;

export const AE4_MODULE_PATH = "lib/application/ae4" as const;

export const AE4_PURPOSE =
  "Declare application integration seams, bindings, and endpoints over AE-3 workflow" as const;

export const AE4_NON_GOALS = [
  "business-logic",
  "deployment",
  "monitoring",
  "product-definition-redesign",
  "governance-redesign",
  "pi-redesign",
  "ae1-redesign",
  "ae2-redesign",
  "ae3-redesign",
  "new-architecture",
] as const;

export type Ae4NonGoal = (typeof AE4_NON_GOALS)[number];

export type ApplicationIntegrationDefinition = Readonly<{
  integrationId: typeof AE4_INTEGRATION_ID;
  packageId: typeof AE4_PACKAGE_ID;
  baseFreezeRef: typeof AE4_BASE_FREEZE_REF;
  workflowRef: typeof AE4_WORKFLOW_REF;
  purpose: typeof AE4_PURPOSE;
  nonGoals: readonly Ae4NonGoal[];
  modulePath: typeof AE4_MODULE_PATH;
}>;

export const APPLICATION_INTEGRATION_DEFINITION = {
  integrationId: AE4_INTEGRATION_ID,
  packageId: AE4_PACKAGE_ID,
  baseFreezeRef: AE4_BASE_FREEZE_REF,
  workflowRef: AE4_WORKFLOW_REF,
  purpose: AE4_PURPOSE,
  nonGoals: AE4_NON_GOALS,
  modulePath: AE4_MODULE_PATH,
} as const satisfies ApplicationIntegrationDefinition;
