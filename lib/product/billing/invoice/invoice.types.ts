/**
 * Product Billing — Invoice types
 */

import type { INVOICE_STATUSES } from "../foundation/foundation.constants";

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type InvoiceMetadata = Record<string, unknown>;

export type BillingInvoice = {
  id: string;
  accountId: string;
  planId: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  detail: string;
  metadata: InvoiceMetadata;
  issuedAt: string;
  updatedAt: string;
};

export type IssueInvoiceInput = {
  id?: string;
  accountId: string;
  planId: string;
  metadata?: InvoiceMetadata;
};

export type UpdateInvoiceStatusInput = {
  invoiceId: string;
  status: InvoiceStatus;
};
