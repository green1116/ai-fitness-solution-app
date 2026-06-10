import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  PaymentReadinessRuntimeResult,
  PaymentReadinessStageResult,
} from "../shared/types";
import { PAYMENT_READINESS_VERSION } from "../shared/types";
import {
  buildPaymentEventDefinitions,
  buildPaymentEventSamples,
  PAYMENT_EVENT_KINDS,
} from "./definitions";
import type { PaymentEventsRuntimePayload } from "./types";
import { PAYMENT_EVENTS_RUNTIME_VERSION } from "./types";

export function validatePaymentEventsRuntime(input?: {
  deploymentId?: string;
}): {
  definitionsValid: boolean;
  samplesValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "payment-events-default";
  const definitions = buildPaymentEventDefinitions();
  const samples = buildPaymentEventSamples({ deploymentId });
  const kinds = new Set(definitions.map((def) => def.kind));

  return {
    definitionsValid:
      definitions.length === PAYMENT_EVENT_KINDS.length &&
      PAYMENT_EVENT_KINDS.every((kind) => kinds.has(kind)),
    samplesValid:
      samples.length === definitions.length &&
      samples.every((sample) => sample.mode === "readiness-stub"),
  };
}

export function runPaymentEventsRuntime(input?: {
  deploymentId?: string;
}): PaymentReadinessRuntimeResult<PaymentEventsRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "payment-events-default";
  const stages: PaymentReadinessStageResult[] = [];

  const definitions = runStage(
    "payment-event-definitions",
    "Payment Event Definitions",
    () => buildPaymentEventDefinitions(),
    stages,
  );
  const samples = runStage(
    "payment-event-samples",
    "Payment Event Samples",
    () => buildPaymentEventSamples({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "payment-events-validate",
    "Payment Events Validation",
    () => validatePaymentEventsRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Payment events runtime validation failed");
  }

  const payload: PaymentEventsRuntimePayload = {
    version: PAYMENT_EVENTS_RUNTIME_VERSION,
    readinessVersion: PAYMENT_READINESS_VERSION,
    definitions,
    samples,
    summary: `payment-events-runtime events=${definitions.length} categories=checkout,payment,invoice,subscription`,
  };

  return finalizeRuntime({
    domain: "payment-events",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
