import type { REVENUE_FOUNDATION_VERSION } from "../shared/types";

export const INVOICE_RUNTIME_VERSION = "v10.0-invoice-runtime-1" as const;

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled" | "void";

export interface InvoiceModel {
  invoiceId: string;
  orderId: string;
  subscriptionId: string;
  customerId: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
}

export interface InvoiceSummary {
  summaryId: string;
  totalInvoices: number;
  paidCount: number;
  overdueCount: number;
  draftCount: number;
  totalBilled: number;
  totalCollected: number;
  currency: string;
  summary: string;
}

export interface InvoiceRuntimePayload {
  version: typeof INVOICE_RUNTIME_VERSION;
  foundationVersion: typeof REVENUE_FOUNDATION_VERSION;
  invoices: InvoiceModel[];
  summary: InvoiceSummary;
}
