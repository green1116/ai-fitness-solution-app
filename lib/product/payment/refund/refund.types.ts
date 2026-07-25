/**
 * Product Payment — Refund types
 */

import type { REFUND_RESULTS } from "../integration/integration.constants";

export type RefundResult = (typeof REFUND_RESULTS)[number];
export type RefundMetadata = Record<string, unknown>;

export type PaymentRefund = {
  id: string;
  captureId: string;
  intentId: string;
  amountCents: number;
  result: RefundResult;
  detail: string;
  metadata: RefundMetadata;
  refundedAt: string;
};

export type RefundCaptureInput = {
  id?: string;
  captureId: string;
  amountCents?: number;
  metadata?: RefundMetadata;
};
