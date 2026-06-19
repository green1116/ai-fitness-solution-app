import type { DeliveryExecutionResult, DeliveryPlan, DeliveryRequest } from "./delivery-orchestrator-types";

export async function runDeliveryOrchestratorHeavy(
  request: DeliveryRequest,
): Promise<DeliveryPlan> {
  const { DeliveryOrchestrator } = await import("./delivery-orchestrator");
  return DeliveryOrchestrator.run(request);
}

export async function executeDeliveryOrchestratorHeavy(
  request: DeliveryRequest,
): Promise<DeliveryExecutionResult> {
  const { DeliveryOrchestrator } = await import("./delivery-orchestrator");
  return DeliveryOrchestrator.execute(request);
}
