/**
 * Product Payment — Capture types
 */

export type CaptureMetadata = Record<string, unknown>;

export type PaymentCapture = {
  id: string;
  intentId: string;
  amountCents: number;
  currency: string;
  detail: string;
  metadata: CaptureMetadata;
  capturedAt: string;
};

export type CaptureIntentInput = {
  id?: string;
  intentId: string;
  amountCents?: number;
  metadata?: CaptureMetadata;
};
