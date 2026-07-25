/**
 * Product P10 — Payment types
 */

import type { PAYMENT_STATUSES } from "../subscription/subscription.constants";

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMetadata = Record<string, unknown>;

export type Payment = {
  id: string;
  invoiceId: string;
  subscriptionId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  detail: string;
  metadata: PaymentMetadata;
  attemptedAt: string;
  capturedAt?: string;
};

export type CapturePaymentInput = {
  id?: string;
  invoiceId: string;
  method?: string;
  metadata?: PaymentMetadata;
};

export type UpdatePaymentStatusInput = {
  paymentId: string;
  status: PaymentStatus;
};
