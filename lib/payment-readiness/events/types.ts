import type { PAYMENT_READINESS_VERSION } from "../shared/types";

export const PAYMENT_EVENTS_RUNTIME_VERSION = "v10.1-payment-events-runtime-1" as const;

export type PaymentEventKind =
  | "checkout.created"
  | "payment.succeeded"
  | "payment.failed"
  | "invoice.paid"
  | "invoice.overdue"
  | "subscription.created"
  | "subscription.renewed"
  | "subscription.cancelled";

export type PaymentEventCategory = "checkout" | "payment" | "invoice" | "subscription";

export interface PaymentEventDefinition {
  kind: PaymentEventKind;
  category: PaymentEventCategory;
  description: string;
  payloadSchema: string;
  idempotent: boolean;
}

export interface PaymentEventSample {
  eventId: string;
  kind: PaymentEventKind;
  occurredAt: string;
  referenceId: string;
  mode: "readiness-stub";
}

export interface PaymentEventsRuntimePayload {
  version: typeof PAYMENT_EVENTS_RUNTIME_VERSION;
  readinessVersion: typeof PAYMENT_READINESS_VERSION;
  definitions: PaymentEventDefinition[];
  samples: PaymentEventSample[];
  summary: string;
}
