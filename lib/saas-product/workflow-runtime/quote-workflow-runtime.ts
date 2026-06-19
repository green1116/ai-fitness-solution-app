import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import { resolveWorkspaceProduct } from "../workspace-runtime/workspace-product-runtime";
import { buildWorkflowInstance } from "./workflow-instance";
import { recordWorkflowEvent } from "./workflow-events";
import {
  findActiveWorkflowByType,
  listWorkflowInstancesByWorkspaceProduct,
  requireWorkflowInstance,
  saveWorkflowInstance,
} from "./workflow-repository";
import { assertValidWorkflowInstance } from "./workflow-validation";

export function createQuoteWorkflow(workspaceProductId: string, actor: string): WorkflowInstance {
  const workspaceProduct = resolveWorkspaceProduct(workspaceProductId);
  const existing = findActiveWorkflowByType(workspaceProductId, "QUOTE");
  if (existing && existing.currentState !== "released") {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_ALREADY_EXISTS,
      `Active quote workflow already exists: ${existing.workflowId}`,
    );
  }

  const instance = buildWorkflowInstance({
    workspaceProductId,
    workflowType: "QUOTE",
    currentState: "draft",
    actor,
    metadata: {
      tenantId: workspaceProduct.tenantId,
      productCode: workspaceProduct.productCode,
    },
  });

  assertValidWorkflowInstance(instance);
  const saved = saveWorkflowInstance(instance);

  recordWorkflowEvent({
    eventType: "WORKFLOW_CREATED",
    workflowId: saved.workflowId,
    workspaceProductId: saved.workspaceProductId,
    workflowType: saved.workflowType,
    toState: saved.currentState,
    actor,
  });

  return saved;
}

export function resolveWorkflow(workflowId: string): WorkflowInstance {
  return requireWorkflowInstance(workflowId);
}

export function listWorkflowInstances(workspaceProductId: string): WorkflowInstance[] {
  if (!workspaceProductId?.trim()) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_INVALID,
      "workspaceProductId is required",
    );
  }
  return listWorkflowInstancesByWorkspaceProduct(workspaceProductId);
}

export {
  transitionWorkflow,
} from "./workflow-transition-engine";

export {
  validateTransition,
  getAllowedTransitions,
  assertValidWorkflowState,
} from "./workflow-state-machine";

export { appendWorkflowHistory } from "./workflow-instance";

export {
  mapWorkflowToCommercialAdapterContext,
} from "./workflow-mapper";

export {
  clearWorkflowRepository,
  getWorkflowRepositorySize,
} from "./workflow-repository";

export {
  clearWorkflowEvents,
  listWorkflowEvents,
  getWorkflowEventCount,
} from "./workflow-events";

export {
  validateWorkflowInstance,
  assertValidWorkflowInstance,
} from "./workflow-validation";
