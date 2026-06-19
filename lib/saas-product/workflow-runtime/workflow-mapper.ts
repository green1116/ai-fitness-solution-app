import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import { mapProductToV47Module } from "../mapping/product-to-v47-mapper";
import { resolveWorkspaceProduct } from "../workspace-runtime/workspace-product-runtime";
import type { CommercialAdapterWorkflowContext } from "../shared/workflow-runtime-types";

export function mapWorkflowToCommercialAdapterContext(
  workflow: WorkflowInstance,
): CommercialAdapterWorkflowContext {
  const workspaceProduct = resolveWorkspaceProduct(workflow.workspaceProductId);
  const context = workspaceProduct.productContextSnapshot;

  return {
    tenantId: workspaceProduct.tenantId,
    workspaceId: workspaceProduct.workspaceId,
    organizationId: context.organizationId,
    userId: context.userId,
    workspaceProductId: workspaceProduct.workspaceProductId,
    workflowId: workflow.workflowId,
    workflowType: workflow.workflowType,
    currentState: workflow.currentState,
    productCode: workspaceProduct.productCode,
    v47Module: mapProductToV47Module(workspaceProduct.productCode),
    v47CustomerWorkspaceMapping: workspaceProduct.v47CustomerWorkspaceMapping,
  };
}
