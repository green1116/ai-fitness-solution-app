import type { PortalContext, PortalModel } from "../shared/portal-runtime-types";
import type { WorkflowType } from "../shared/workflow-runtime-types";

export function composePortalModel(context: PortalContext): PortalModel {
  const primaryWorkspaceProduct = context.workspaceProducts[0];
  const workflowByType: Partial<Record<WorkflowType, (typeof context.workflows)[number]>> = {};

  for (const workflow of context.workflows) {
    workflowByType[workflow.workflowType] = workflow;
  }

  return {
    context,
    primaryWorkspaceProduct,
    workflowByType,
  };
}
