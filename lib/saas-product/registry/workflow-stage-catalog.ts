import { PRODUCT_ERROR_CODES, SaasProductError } from "../shared/product-errors";
import type { WorkflowStageDefinition } from "../shared/product-types";

export const WORKFLOW_STAGE_DEFINITIONS: WorkflowStageDefinition[] = [
  {
    workflowKey: "commercial.quote",
    stages: ["intake", "quote", "executed"],
    v47Module: "access-layer/quote",
    requiredPermissions: ["quote:create", "delivery:execute"],
    requiredFeature: "commercial.quote",
  },
  {
    workflowKey: "commercial.package",
    stages: ["build", "validate", "ready"],
    v47Module: "package/",
    requiredPermissions: ["package:download"],
    requiredFeature: "commercial.deliverable_package",
  },
  {
    workflowKey: "commercial.delivery",
    stages: ["orchestrate", "execute", "complete"],
    v47Module: "orchestration/",
    requiredPermissions: ["delivery:execute"],
    requiredFeature: "commercial.delivery_orchestrator",
  },
  {
    workflowKey: "commercial.approval",
    stages: ["submit", "review", "approved"],
    v47Module: "approval/",
    requiredPermissions: ["approval:submit", "approval:approve"],
    requiredFeature: "commercial.approval",
  },
  {
    workflowKey: "commercial.audit",
    stages: ["record", "query", "export"],
    v47Module: "audit/",
    requiredPermissions: ["audit:read"],
    requiredFeature: "commercial.audit",
  },
  {
    workflowKey: "commercial.release",
    stages: ["prepare", "publish", "ledger"],
    v47Module: "release/",
    requiredPermissions: ["release:publish"],
    requiredFeature: "commercial.release",
  },
];

const WORKFLOW_REGISTRY = new Map<string, WorkflowStageDefinition>(
  WORKFLOW_STAGE_DEFINITIONS.map((workflow) => [workflow.workflowKey, workflow]),
);

export function resolveWorkflowStage(workflowKey: string): WorkflowStageDefinition {
  const workflow = WORKFLOW_REGISTRY.get(workflowKey);
  if (!workflow) {
    throw new SaasProductError(
      PRODUCT_ERROR_CODES.WORKFLOW_STAGE_NOT_FOUND,
      `Workflow stage not found: ${workflowKey}`,
    );
  }
  return {
    ...workflow,
    stages: [...workflow.stages],
    requiredPermissions: [...workflow.requiredPermissions],
  };
}

export function listWorkflowStages(): WorkflowStageDefinition[] {
  return WORKFLOW_STAGE_DEFINITIONS.map((workflow) => resolveWorkflowStage(workflow.workflowKey));
}
