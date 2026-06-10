import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildDeliveryPackage } from "./builders";
import type { DeliveryRuntimePayload } from "./types";
import { DELIVERY_ARTIFACT_TYPES, DELIVERY_RUNTIME_VERSION } from "./types";

export function validateDeliveryRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const delivery = buildDeliveryPackage(input);
  return {
    valid:
      delivery.artifacts.length === DELIVERY_ARTIFACT_TYPES.length &&
      delivery.allReady,
  };
}

export function runDeliveryRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<DeliveryRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  const stages: AutopilotStageResult[] = [];

  const delivery = runStage(
    "delivery-package",
    "Delivery Package",
    () => buildDeliveryPackage({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "delivery-validate",
    "Delivery Validation",
    () => validateDeliveryRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Delivery runtime validation failed");

  const payload: DeliveryRuntimePayload = {
    version: DELIVERY_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    delivery,
    summary: `delivery-runtime artifacts=${delivery.artifacts.length} allReady=${delivery.allReady}`,
  };

  return finalizeRuntime({
    domain: "delivery-runtime",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
