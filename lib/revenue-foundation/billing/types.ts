import type { REVENUE_FOUNDATION_VERSION } from "../shared/types";

export const BILLING_RUNTIME_VERSION = "v10.0-billing-runtime-1" as const;

export type BillingEventKind =
  | "subscription-started"
  | "invoice-issued"
  | "payment-received"
  | "renewal-scheduled"
  | "renewal-completed"
  | "subscription-cancelled";

export interface BillingSnapshot {
  snapshotId: string;
  customerId: string;
  activeSubscriptions: number;
  outstandingBalance: number;
  collectedRevenue: number;
  currency: string;
  lastInvoiceStatus: string;
  asOf: string;
}

export interface BillingHistoryEvent {
  eventId: string;
  kind: BillingEventKind;
  amount: number;
  currency: string;
  occurredAt: string;
  referenceId: string;
  note: string;
}

export interface BillingHistory {
  historyId: string;
  customerId: string;
  events: BillingHistoryEvent[];
}

export interface BillingSummary {
  summaryId: string;
  totalEvents: number;
  totalCollected: number;
  outstandingBalance: number;
  currency: string;
  summary: string;
}

export interface BillingRuntimePayload {
  version: typeof BILLING_RUNTIME_VERSION;
  foundationVersion: typeof REVENUE_FOUNDATION_VERSION;
  snapshot: BillingSnapshot;
  history: BillingHistory;
  summary: BillingSummary;
}
