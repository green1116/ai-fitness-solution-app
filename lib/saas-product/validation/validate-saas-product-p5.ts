import { SAAS_PRODUCT_P5_TAG } from "../shared/workflow-p5-types";
import { WORKFLOW_P5_ERROR_CODES, SaasWorkflowP5Error } from "../shared/workflow-runtime-errors-p5";
import { buildOwnerContext } from "@/lib/saas-rbac";
import { resolveProductContext } from "../context/resolve-product-context";
import {
  clearWorkflowEvents,
  clearWorkflowRepository,
  createQuoteWorkflow,
  transitionWorkflow,
} from "../workflow-runtime/quote-workflow-runtime";
import {
  clearWorkspaceProductRepository,
  createProductWorkspace,
} from "../workspace-runtime/workspace-product-runtime";
import {
  assertWorkflowDependency,
  buildBusinessProcessAdapterContext,
  checkWorkflowDependency,
  clearWorkflowP5Events,
  createApprovalWorkflow,
  createDeliveryWorkflow,
  createReleaseWorkflow,
  getBusinessAllowedTransitions,
  getWorkflowP5EventCount,
  isBusinessProcessReady,
  listWorkflowP5Events,
  recordBusinessProcessReadyEvent,
  transitionBusinessWorkflow,
  validateBusinessTransition,
  validateBusinessWorkflowInstance,
} from "../workflow-runtime/business-process-runtime";

export function validateSaasProductP5Runtime(): { valid: boolean; summary: string } {
  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  const context = resolveProductContext(buildOwnerContext(), "kickstart-package");
  const workspaceProduct = createProductWorkspace({ context, status: "active" });
  const actor = context.userId;
  const workspaceProductId = workspaceProduct.workspaceProductId;

  let dependencyDenied = false;
  try {
    createApprovalWorkflow(workspaceProductId, actor);
  } catch (error) {
    dependencyDenied =
      error instanceof SaasWorkflowP5Error &&
      error.code === WORKFLOW_P5_ERROR_CODES.WORKFLOW_DEPENDENCY_NOT_SATISFIED;
  }

  const quote = createQuoteWorkflow(workspaceProductId, actor);
  transitionWorkflow({ workflowId: quote.workflowId, toState: "estimating", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "review", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "approved", actor });

  assertWorkflowDependency(workspaceProductId, "APPROVAL");
  const approval = createApprovalWorkflow(workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "reviewing", actor });
  const approvedApproval = transitionBusinessWorkflow({
    workflowId: approval.workflowId,
    toState: "approved",
    actor,
  });

  assertWorkflowDependency(workspaceProductId, "DELIVERY");
  const delivery = createDeliveryWorkflow(workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: delivery.workflowId, toState: "in_progress", actor });
  const completedDelivery = transitionBusinessWorkflow({
    workflowId: delivery.workflowId,
    toState: "completed",
    actor,
  });

  assertWorkflowDependency(workspaceProductId, "RELEASE");
  const release = createReleaseWorkflow(workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: release.workflowId, toState: "ready", actor });
  const released = transitionBusinessWorkflow({
    workflowId: release.workflowId,
    toState: "released",
    actor,
  });

  const adapterContext = buildBusinessProcessAdapterContext(workspaceProductId);
  recordBusinessProcessReadyEvent(workspaceProductId, "RELEASE", released.workflowId);

  const valid =
    dependencyDenied &&
    checkWorkflowDependency(workspaceProductId, "APPROVAL") &&
    checkWorkflowDependency(workspaceProductId, "DELIVERY") &&
    checkWorkflowDependency(workspaceProductId, "RELEASE") &&
    validateBusinessWorkflowInstance(approvedApproval) &&
    validateBusinessWorkflowInstance(completedDelivery) &&
    validateBusinessWorkflowInstance(released) &&
    validateBusinessTransition("APPROVAL", "pending", "reviewing") &&
    validateBusinessTransition("DELIVERY", "planned", "in_progress") &&
    validateBusinessTransition("RELEASE", "draft", "ready") &&
    !validateBusinessTransition("APPROVAL", "pending", "approved") &&
    getBusinessAllowedTransitions("DELIVERY", "in_progress").includes("completed") &&
    adapterContext.quote?.currentState === "approved" &&
    adapterContext.approval?.currentState === "approved" &&
    adapterContext.delivery?.currentState === "completed" &&
    adapterContext.release?.currentState === "released" &&
    isBusinessProcessReady(adapterContext) &&
    getWorkflowP5EventCount() >= 4 &&
    listWorkflowP5Events(workspaceProductId).some((event) => event.eventType === "BUSINESS_PROCESS_READY");

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  return {
    valid,
    summary: `p5Tag=${SAAS_PRODUCT_P5_TAG} businessProcessValid=${valid}`,
  };
}
