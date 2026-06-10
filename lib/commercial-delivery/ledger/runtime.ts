import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "../shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";
import { buildDeliveryLedger } from "./builders";
import type { DeliveryLedgerRuntimePayload } from "./types";
import { DELIVERY_LEDGER_RUNTIME_VERSION, LEDGER_EVENT_TYPES } from "./types";

export function validateDeliveryLedgerRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const ledger = buildDeliveryLedger(input);
  return {
    valid:
      ledger.entries.length === LEDGER_EVENT_TYPES.length &&
      ledger.entries.every((e) => e.message.length > 0),
  };
}

export function runDeliveryLedgerRuntime(input?: {
  deploymentId?: string;
}): CommercialDeliveryRuntimeResult<DeliveryLedgerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "ledger-default";
  const stages: CommercialDeliveryStageResult[] = [];

  const ledger = runStage(
    "delivery-ledger-build",
    "Delivery Ledger",
    () => buildDeliveryLedger({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "delivery-ledger-validate",
    "Ledger Validation",
    () => validateDeliveryLedgerRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Delivery ledger validation failed");

  const payload: DeliveryLedgerRuntimePayload = {
    version: DELIVERY_LEDGER_RUNTIME_VERSION,
    deliveryVersion: COMMERCIAL_DELIVERY_VERSION,
    ledger,
    summary: `delivery-ledger events=${ledger.eventCount} project=${ledger.projectId}`,
  };

  return finalizeRuntime({
    domain: "delivery-ledger",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
