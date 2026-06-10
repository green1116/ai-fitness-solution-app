import type { PAYMENT_READINESS_VERSION } from "../shared/types";

export const WEBHOOK_CONTRACT_RUNTIME_VERSION = "v10.1-webhook-contract-runtime-1" as const;

export interface WebhookEventSchema {
  schemaId: string;
  version: string;
  requiredFields: string[];
  optionalFields: string[];
  envelope: string;
}

export interface WebhookSignatureSchema {
  schemaId: string;
  algorithm: "hmac-sha256" | "rsa-sha256" | "md5-sign";
  headerName: string;
  timestampHeader: string;
  toleranceSeconds: number;
}

export interface WebhookRetrySchema {
  schemaId: string;
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  retryableStatusCodes: number[];
}

export interface WebhookIdempotencySchema {
  schemaId: string;
  keyHeader: string;
  keySource: "event-id" | "idempotency-key" | "composite";
  ttlSeconds: number;
  dedupeWindowSeconds: number;
}

export interface WebhookContractRuntimePayload {
  version: typeof WEBHOOK_CONTRACT_RUNTIME_VERSION;
  readinessVersion: typeof PAYMENT_READINESS_VERSION;
  eventSchema: WebhookEventSchema;
  signatureSchema: WebhookSignatureSchema;
  retrySchema: WebhookRetrySchema;
  idempotencySchema: WebhookIdempotencySchema;
  summary: string;
}
