/**
 * Product P10 — Invoice types
 */

import type { INVOICE_STATUSES } from "../subscription/subscription.constants";

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type InvoiceMetadata = Record<string, unknown>;

export type Invoice = {
  id: string;
  billingId: string;
  subscriptionId: string;
  number: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  detail: string;
  metadata: InvoiceMetadata;
  issuedAt: string;
  paidAt?: string;
};

export type IssueInvoiceInput = {
  id?: string;
  billingId: string;
  number?: string;
  currency?: string;
  metadata?: InvoiceMetadata;
};

export type UpdateInvoiceStatusInput = {
  invoiceId: string;
  status: InvoiceStatus;
};
