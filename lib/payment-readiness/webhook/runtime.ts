import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  PaymentReadinessRuntimeResult,
  PaymentReadinessStageResult,
} from "../shared/types";
import { PAYMENT_READINESS_VERSION } from "../shared/types";
import {
  buildWebhookEventSchema,
  buildWebhookIdempotencySchema,
  buildWebhookRetrySchema,
  buildWebhookSignatureSchema,
} from "./schemas";
import type { WebhookContractRuntimePayload } from "./types";
import { WEBHOOK_CONTRACT_RUNTIME_VERSION } from "./types";

export function validateWebhookContractRuntime(input?: {
  deploymentId?: string;
}): {
  eventSchemaValid: boolean;
  signatureSchemaValid: boolean;
  retrySchemaValid: boolean;
  idempotencySchemaValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "webhook-default";
  const eventSchema = buildWebhookEventSchema({ deploymentId });
  const signatureSchema = buildWebhookSignatureSchema({ deploymentId });
  const retrySchema = buildWebhookRetrySchema({ deploymentId });
  const idempotencySchema = buildWebhookIdempotencySchema({ deploymentId });

  return {
    eventSchemaValid:
      eventSchema.requiredFields.includes("id") &&
      eventSchema.requiredFields.includes("type"),
    signatureSchemaValid:
      signatureSchema.toleranceSeconds > 0 &&
      signatureSchema.headerName.length > 0,
    retrySchemaValid:
      retrySchema.maxAttempts >= 3 &&
      retrySchema.backoffMultiplier >= 2,
    idempotencySchemaValid:
      idempotencySchema.ttlSeconds > 0 &&
      idempotencySchema.dedupeWindowSeconds > 0,
  };
}

export function runWebhookContractRuntime(input?: {
  deploymentId?: string;
}): PaymentReadinessRuntimeResult<WebhookContractRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "webhook-default";
  const stages: PaymentReadinessStageResult[] = [];

  const eventSchema = runStage(
    "webhook-event-schema",
    "Webhook Event Schema",
    () => buildWebhookEventSchema({ deploymentId }),
    stages,
  );
  const signatureSchema = runStage(
    "webhook-signature-schema",
    "Webhook Signature Schema",
    () => buildWebhookSignatureSchema({ deploymentId }),
    stages,
  );
  const retrySchema = runStage(
    "webhook-retry-schema",
    "Webhook Retry Schema",
    () => buildWebhookRetrySchema({ deploymentId }),
    stages,
  );
  const idempotencySchema = runStage(
    "webhook-idempotency-schema",
    "Webhook Idempotency Schema",
    () => buildWebhookIdempotencySchema({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "webhook-validate",
    "Webhook Contract Validation",
    () => validateWebhookContractRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Webhook contract runtime validation failed");
  }

  const payload: WebhookContractRuntimePayload = {
    version: WEBHOOK_CONTRACT_RUNTIME_VERSION,
    readinessVersion: PAYMENT_READINESS_VERSION,
    eventSchema,
    signatureSchema,
    retrySchema,
    idempotencySchema,
    summary: `webhook-contract-runtime event=${eventSchema.schemaId} signature=${signatureSchema.algorithm} retries=${retrySchema.maxAttempts}`,
  };

  return finalizeRuntime({
    domain: "webhook-contract",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
