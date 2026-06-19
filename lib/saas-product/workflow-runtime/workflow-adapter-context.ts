import type { BusinessProcessAdapterContext } from "../shared/workflow-p5-types";
import type { WorkflowType } from "../shared/workflow-runtime-types";
import { resolveWorkspaceProduct } from "../workspace-runtime/workspace-product-runtime";
import { mapWorkflowToCommercialAdapterContext } from "./workflow-mapper";
import { findActiveWorkflowByType } from "./workflow-repository";
import { getTerminalBusinessWorkflowState } from "./multi-workflow-state-machine";
import { recordWorkflowP5Event } from "./workflow-events-p5";

const BUSINESS_WORKFLOW_TYPES: WorkflowType[] = ["QUOTE", "APPROVAL", "DELIVERY", "RELEASE"];

export function buildBusinessProcessAdapterContext(workspaceProductId: string): BusinessProcessAdapterContext {
  const workspaceProduct = resolveWorkspaceProduct(workspaceProductId);
  const context: BusinessProcessAdapterContext = {
    workspaceProductId,
    tenantId: workspaceProduct.tenantId,
    productCode: workspaceProduct.productCode,
  };

  for (const workflowType of BUSINESS_WORKFLOW_TYPES) {
    const instance = findActiveWorkflowByType(workspaceProductId, workflowType);
    if (!instance) continue;

    const adapterContext = mapWorkflowToCommercialAdapterContext(instance);
    switch (workflowType) {
      case "QUOTE":
        context.quote = adapterContext;
        break;
      case "APPROVAL":
        context.approval = adapterContext;
        break;
      case "DELIVERY":
        context.delivery = adapterContext;
        break;
      case "RELEASE":
        context.release = adapterContext;
        break;
    }
  }

  return context;
}

export function isBusinessProcessReady(context: BusinessProcessAdapterContext): boolean {
  return context.release?.currentState === getTerminalBusinessWorkflowState("RELEASE");
}

export function recordBusinessProcessReadyEvent(
  workspaceProductId: string,
  workflowType: WorkflowType,
  workflowId?: string,
): void {
  recordWorkflowP5Event({
    eventType: "BUSINESS_PROCESS_READY",
    workspaceProductId,
    workflowType,
    workflowId,
    detail: "business process adapter context ready",
  });
}
