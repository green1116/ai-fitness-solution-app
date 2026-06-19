import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import { resolveWorkspaceProduct } from "../workspace-runtime/workspace-product-runtime";
import { buildWorkflowInstance } from "./workflow-instance";
import { recordWorkflowEvent } from "./workflow-events";
import { assertWorkflowDependency } from "./workflow-dependency";
import {
  findActiveWorkflowByType,
  saveWorkflowInstance,
} from "./workflow-repository";
import { assertValidBusinessWorkflowInstance } from "./workflow-validation-p5";
import { getTerminalBusinessWorkflowState } from "./multi-workflow-state-machine";

export function createApprovalWorkflow(workspaceProductId: string, actor: string): WorkflowInstance {
  const workspaceProduct = resolveWorkspaceProduct(workspaceProductId);
  assertWorkflowDependency(workspaceProductId, "APPROVAL");

  const existing = findActiveWorkflowByType(workspaceProductId, "APPROVAL");
  const terminalState = getTerminalBusinessWorkflowState("APPROVAL");
  if (existing && existing.currentState !== terminalState) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_ALREADY_EXISTS,
      `Active approval workflow already exists: ${existing.workflowId}`,
    );
  }

  const instance = buildWorkflowInstance({
    workspaceProductId,
    workflowType: "APPROVAL",
    currentState: "pending",
    actor,
    metadata: {
      tenantId: workspaceProduct.tenantId,
      productCode: workspaceProduct.productCode,
    },
  });

  assertValidBusinessWorkflowInstance(instance);
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
