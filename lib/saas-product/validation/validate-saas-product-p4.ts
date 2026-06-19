import { buildOwnerContext } from "@/lib/saas-rbac";
import { resolveProductContext } from "../context/resolve-product-context";
import {
  clearWorkflowEvents,
  clearWorkflowRepository,
  createQuoteWorkflow,
  getAllowedTransitions,
  getWorkflowEventCount,
  getWorkflowRepositorySize,
  listWorkflowEvents,
  listWorkflowInstances,
  mapWorkflowToCommercialAdapterContext,
  resolveWorkflow,
  transitionWorkflow,
  validateTransition,
  validateWorkflowInstance,
} from "../workflow-runtime/quote-workflow-runtime";
import {
  clearWorkspaceProductRepository,
  createProductWorkspace,
} from "../workspace-runtime/workspace-product-runtime";

export function validateSaasProductP4Runtime(): { valid: boolean; summary: string } {
  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();

  const context = resolveProductContext(buildOwnerContext(), "kickstart-package");
  const workspaceProduct = createProductWorkspace({ context, status: "active" });
  const workflow = createQuoteWorkflow(workspaceProduct.workspaceProductId, context.userId);

  transitionWorkflow({
    workflowId: workflow.workflowId,
    toState: "estimating",
    actor: context.userId,
    reason: "start estimate",
  });
  transitionWorkflow({
    workflowId: workflow.workflowId,
    toState: "review",
    actor: context.userId,
  });
  transitionWorkflow({
    workflowId: workflow.workflowId,
    toState: "approved",
    actor: context.userId,
  });
  const released = transitionWorkflow({
    workflowId: workflow.workflowId,
    toState: "released",
    actor: context.userId,
  });

  const adapterContext = mapWorkflowToCommercialAdapterContext(released);
  const valid =
    validateWorkflowInstance(released) &&
    released.currentState === "released" &&
    released.history.length === 4 &&
    getWorkflowRepositorySize() === 1 &&
    getWorkflowEventCount() >= 5 &&
    adapterContext.workflowId === released.workflowId &&
    adapterContext.tenantId === context.tenantId;

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();

  return {
    valid,
    summary: `workflowRuntimeValid=${valid}`,
  };
}
