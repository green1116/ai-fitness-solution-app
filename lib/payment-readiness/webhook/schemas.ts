import type {
  WebhookEventSchema,
  WebhookIdempotencySchema,
  WebhookRetrySchema,
  WebhookSignatureSchema,
} from "./types";

export function buildWebhookEventSchema(input?: {
  deploymentId?: string;
}): WebhookEventSchema {
  const deploymentId = input?.deploymentId ?? "webhook-default";
  return {
    schemaId: `webhook-event-schema-${deploymentId}`,
    version: "1.0",
    requiredFields: ["id", "type", "created", "data", "livemode"],
    optionalFields: ["api_version", "request", "pending_webhooks"],
    envelope: "WebhookEventEnvelope",
  };
}

export function buildWebhookSignatureSchema(input?: {
  deploymentId?: string;
}): WebhookSignatureSchema {
  const deploymentId = input?.deploymentId ?? "webhook-default";
  return {
    schemaId: `webhook-signature-schema-${deploymentId}`,
    algorithm: "hmac-sha256",
    headerName: "X-Webhook-Signature",
    timestampHeader: "X-Webhook-Timestamp",
    toleranceSeconds: 300,
  };
}

export function buildWebhookRetrySchema(input?: {
  deploymentId?: string;
}): WebhookRetrySchema {
  const deploymentId = input?.deploymentId ?? "webhook-default";
  return {
    schemaId: `webhook-retry-schema-${deploymentId}`,
    maxAttempts: 5,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 60_000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  };
}

export function buildWebhookIdempotencySchema(input?: {
  deploymentId?: string;
}): WebhookIdempotencySchema {
  const deploymentId = input?.deploymentId ?? "webhook-default";
  return {
    schemaId: `webhook-idempotency-schema-${deploymentId}`,
    keyHeader: "X-Idempotency-Key",
    keySource: "event-id",
    ttlSeconds: 86_400,
    dedupeWindowSeconds: 300,
  };
}
