/**
 * Product Billing Audit — Event types
 */

import type {
  BILLING_AUDIT_CATEGORIES,
  BILLING_AUDIT_SEVERITIES,
} from "../traceability/traceability.constants";

export type BillingAuditCategory =
  (typeof BILLING_AUDIT_CATEGORIES)[number];
export type BillingAuditSeverity =
  (typeof BILLING_AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type BillingAuditEvent = {
  id: string;
  category: BillingAuditCategory;
  severity: BillingAuditSeverity;
  accountId: string;
  action: string;
  resource: string;
  amountCents?: number;
  detail: string;
  metadata: EventMetadata;
  recordedAt: string;
};

export type RecordBillingAuditEventInput = {
  id?: string;
  category: BillingAuditCategory;
  severity?: BillingAuditSeverity;
  accountId: string;
  action: string;
  resource: string;
  amountCents?: number;
  metadata?: EventMetadata;
};
