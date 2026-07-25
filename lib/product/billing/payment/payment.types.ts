/**
 * Product Billing — Payment types
 */

import type { PAYMENT_STATUSES } from "../foundation/foundation.constants";

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMetadata = Record<string, unknown>;

export type BillingPayment = {
  id: string;
  invoiceId: string;
  accountId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  detail: string;
  metadata: PaymentMetadata;
  attemptedAt: string;
  updatedAt: string;
};

export type CapturePaymentInput = {
  id?: string;
  invoiceId: string;
  succeed?: boolean;
  metadata?: PaymentMetadata;
};

export type UpdatePaymentStatusInput = {
  paymentId: string;
  status: PaymentStatus;
};
