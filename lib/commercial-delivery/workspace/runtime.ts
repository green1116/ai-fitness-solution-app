import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "../shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";
import { buildDeliveryWorkspace } from "./builders";
import type { DeliveryWorkspaceRuntimePayload } from "./types";
import { DELIVERY_WORKSPACE_RUNTIME_VERSION } from "./types";

export function validateDeliveryWorkspaceRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const workspace = buildDeliveryWorkspace(input);
  return {
    valid:
      workspace.deliverables.length === 4 &&
      workspace.project.projectId.length > 0 &&
      workspace.job.autopilotRef.length > 0,
  };
}

export function runDeliveryWorkspaceRuntime(input?: {
  deploymentId?: string;
}): CommercialDeliveryRuntimeResult<DeliveryWorkspaceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  const stages: CommercialDeliveryStageResult[] = [];

  const workspace = runStage(
    "delivery-workspace-build",
    "Delivery Workspace",
    () => buildDeliveryWorkspace({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "delivery-workspace-validate",
    "Workspace Validation",
    () => validateDeliveryWorkspaceRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Delivery workspace validation failed");

  const payload: DeliveryWorkspaceRuntimePayload = {
    version: DELIVERY_WORKSPACE_RUNTIME_VERSION,
    deliveryVersion: COMMERCIAL_DELIVERY_VERSION,
    workspace,
    summary: `delivery-workspace project=${workspace.project.projectId} deliverables=${workspace.deliverables.length} status=${workspace.deliveryStatus}`,
  };

  return finalizeRuntime({
    domain: "delivery-workspace",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
