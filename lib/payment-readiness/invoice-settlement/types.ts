import type { PAYMENT_READINESS_VERSION } from "../shared/types";

export const INVOICE_SETTLEMENT_RUNTIME_VERSION = "v10.1-invoice-settlement-runtime-1" as const;

export type InvoiceSettlementStatus = "pending" | "paid" | "overdue" | "refunded";

export interface InvoiceSettlementState {
  status: InvoiceSettlementStatus;
  label: string;
  description: string;
  terminal: boolean;
}

export interface InvoiceSettlementTransition {
  from: InvoiceSettlementStatus;
  to: InvoiceSettlementStatus;
  trigger: string;
}

export interface InvoiceSettlementRecord {
  recordId: string;
  invoiceId: string;
  status: InvoiceSettlementStatus;
  amount: number;
  currency: string;
  updatedAt: string;
  mode: "readiness-stub";
}

export interface InvoiceSettlementRuntimePayload {
  version: typeof INVOICE_SETTLEMENT_RUNTIME_VERSION;
  readinessVersion: typeof PAYMENT_READINESS_VERSION;
  states: InvoiceSettlementState[];
  transitions: InvoiceSettlementTransition[];
  records: InvoiceSettlementRecord[];
  summary: string;
}
